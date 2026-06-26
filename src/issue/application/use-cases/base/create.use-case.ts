import { GetAreaQuery, GetStateQuery } from '@core/area/application/use-cases';
import { ISSUE_TYPE, PRIORITY } from '@core/issue/domain/entities';
import { IssueErrorCodes, IssueErrorMessages } from '@core/issue/domain/errors';
import { IIssueRepository } from '@core/issue/domain/repositories';
import { FindProjectMemberQuery } from '@core/project/application/use-cases';
import { MemberErrorCodes, MemberErrorMessages } from '@core/project/domain/errors';
import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { CreateIssueDto } from '../../dtos';

@Injectable()
export class CreateIssueUseCase {
    constructor(
        @Inject('IIssueRepository')
        private readonly issueRepo: IIssueRepository,
        private readonly getArea: GetAreaQuery,
        private readonly getState: GetStateQuery,
        private readonly getProjectMember: FindProjectMemberQuery,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(dto: CreateIssueDto, slug: string, key: string, userId: string) {
        try {
            const { project } = await this.projectPolicy.ensureProjectAccess(slug, userId, [
                'owner',
                'admin',
            ]);

            let areaId;

            if (dto.stateId) {
                const state = await this.getState.execute(key, dto.stateId, userId);
                areaId = state.areaId;
            } else {
                const area = await this.getArea.execute({ key }, userId);
                areaId = area.id;
            }

            await this.validateContext(dto, userId, project.id);

            const data = {
                ...dto,
                areaId,
                type: dto.type ?? ISSUE_TYPE.TASK,
                priority: dto.priority ?? PRIORITY.MEDIUM,
            };

            const result = await this.issueRepo.create(data, userId);

            return {
                success: true,
                message: 'Задача успешно создана',
                id: result.id,
            };
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }

            throw new BaseException(
                {
                    code: IssueErrorCodes.CREATE_FAILED,
                    message: IssueErrorMessages[IssueErrorCodes.CREATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async validateContext(dto: CreateIssueDto, userId: string, projectId: string) {
        if (dto.assigneeId) {
            const projectMember = await this.getProjectMember.execute(projectId, dto.assigneeId);

            if (!projectMember) {
                throw new BaseException(
                    {
                        code: MemberErrorCodes.NOT_FOUND,
                        message: MemberErrorMessages[MemberErrorCodes.NOT_FOUND],
                        details: [{ target: 'assignee' }],
                    },
                    HttpStatus.NOT_FOUND,
                );
            }
        }

        if (dto.reporterId) {
            const projectMember = await this.getProjectMember.execute(projectId, dto.reporterId);

            if (!projectMember) {
                throw new BaseException(
                    {
                        code: MemberErrorCodes.NOT_FOUND,
                        message: MemberErrorMessages[MemberErrorCodes.NOT_FOUND],
                        details: [{ target: 'reporter' }],
                    },
                    HttpStatus.NOT_FOUND,
                );
            }
        }

        if (dto.parentId) {
            const parent = await this.issueRepo.findOne(dto.parentId, userId);

            if (!parent) {
                throw new BaseException(
                    {
                        code: IssueErrorCodes.PARENT_NOT_FOUND,
                        message: IssueErrorMessages[IssueErrorCodes.PARENT_NOT_FOUND],
                    },
                    HttpStatus.NOT_FOUND,
                );
            }
        }
    }
}
