import {
    ProjectErrorCodes,
    ProjectErrorMessages,
    ProjectStateErrorCodes,
    ProjectStateErrorMessages,
} from '@core/projects/domain/errors';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { IProjectsRepository, IProjectStatesRepository } from '@core/projects/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { ReorderProjectsStatesDto } from '../../dtos';

@Injectable()
export class ReorderStateUseCase {
    constructor(
        @Inject('IProjectsRepository')
        private readonly projectsRepo: IProjectsRepository,
        @Inject('IProjectStatesRepository')
        private readonly projectStatesRepo: IProjectStatesRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, dto: ReorderProjectsStatesDto, userId: string) {
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

        const state = await this.projectStatesRepo.find(slug);

        if (!state) {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.NOT_FOUND,
                    message: ProjectStateErrorMessages[ProjectStateErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        // TODO: ADD REODER STATES
        void dto;
        const result = true;

        return {
            success: result,
            message: result
                ? 'Состояние успешно восстановлено'
                : 'Не удалось восстановить состояние: запись не найдена или уже активна',
        };
    }
}
