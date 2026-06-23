import { GetAreaQuery, GetStateQuery } from '@core/area/application/use-cases';
import { IssueErrorCodes, IssueErrorMessages } from '@core/issue/domain/errors';
import { IIssueRepository } from '@core/issue/domain/repositories';
import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { MoveIssueDto } from '../../dtos';

@Injectable()
export class MoveIssueUseCase {
    constructor(
        @Inject('IIssueRepository')
        private readonly issueRepo: IIssueRepository,
        private readonly getArea: GetAreaQuery,
        private readonly getState: GetStateQuery,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(id: string, slug: string, key: string, dto: MoveIssueDto, userId: string) {
        try {
            await this.projectPolicy.ensureProjectAccess(slug, userId, ['owner', 'admin']);

            const issue = await this.issueRepo.findOne(id, userId);

            if (!issue) {
                throw new BaseException(
                    {
                        code: IssueErrorCodes.NOT_FOUND,
                        message: IssueErrorMessages[IssueErrorCodes.NOT_FOUND],
                    },
                    HttpStatus.NOT_FOUND,
                );
            }
            await this.validateContext(dto, key, userId);

            const result = await this.issueRepo.update(id, dto, userId);

            return {
                success: result,
                message: result ? 'Задача успешно перемещена' : 'Не удалось переместить задачу',
            };
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }

            throw new BaseException(
                {
                    code: IssueErrorCodes.MOVE_FAILED,
                    message: IssueErrorMessages[IssueErrorCodes.MOVE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async validateContext(dto: MoveIssueDto, key: string, userId: string) {
        if (dto.targetAreaId) {
            await this.getArea.execute({ key }, userId);
        }
        if (dto.targetStateId) {
            await this.getState.execute(key, dto.targetStateId, userId);
        }
    }
}
