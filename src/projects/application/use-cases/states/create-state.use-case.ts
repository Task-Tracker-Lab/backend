import { IProjectsRepository, IProjectStatesRepository } from '@core/projects/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateProjectStateDto } from '../../dtos';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { BaseException } from '@shared/error';
import {
    ProjectErrorCodes,
    ProjectErrorMessages,
    ProjectStateErrorCodes,
    ProjectStateErrorMessages,
} from '@core/projects/domain/errors';

const MAX_STATES_PER_PROJECT = 20;

@Injectable()
export class CreateStateUseCase {
    constructor(
        @Inject('IProjectsRepository')
        private readonly projectsRepo: IProjectsRepository,
        @Inject('IProjectStatesRepository')
        private readonly projectStatesRepo: IProjectStatesRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, dto: CreateProjectStateDto, userId: string) {
        const project = await this.projectsRepo.findOne(slug);

        if (!project) {
            throw new BaseException(
                {
                    code: ProjectErrorCodes.NOT_FOUND,
                    message: ProjectErrorMessages[ProjectErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        await this.policy.ensureTeamAccess(project.teamId, userId, 'admin');

        const currentCount = await this.projectStatesRepo.countByProject(project.id);
        if (currentCount >= MAX_STATES_PER_PROJECT) {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.MAX_LIMIT_REACHED,
                    message: ProjectStateErrorMessages[ProjectStateErrorCodes.MAX_LIMIT_REACHED],
                    details: [{ current: currentCount, max: MAX_STATES_PER_PROJECT }],
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        if (dto.title) {
            const existingByTitle = await this.projectStatesRepo.findByTitle(project.id, dto.title);

            if (existingByTitle) {
                throw new BaseException(
                    {
                        code: ProjectStateErrorCodes.DUPLICATE_TITLE,
                        message: ProjectStateErrorMessages[ProjectStateErrorCodes.DUPLICATE_TITLE],
                        details: [{ title: dto.title }],
                    },
                    HttpStatus.CONFLICT,
                );
            }
        }

        if (dto.stateType && dto.stateType !== 'custom') {
            const existingByType = await this.projectStatesRepo.findByStateType(
                project.id,
                dto.stateType,
            );

            if (existingByType) {
                throw new BaseException(
                    {
                        code: ProjectStateErrorCodes.DUPLICATE_TYPE,
                        message: ProjectStateErrorMessages[ProjectStateErrorCodes.DUPLICATE_TYPE],
                        details: [{ stateType: dto.stateType }],
                    },
                    HttpStatus.CONFLICT,
                );
            }
        }

        const result = await this.projectStatesRepo.create({
            ...dto,
            projectId: project.id,
            createdBy: userId,
        });

        return {
            success: true,
            message: 'Состояние успешно создано',
            stateId: result.id,
        };
    }
}
