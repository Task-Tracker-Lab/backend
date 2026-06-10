import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { IProjectsRepository, IProjectStatesRepository } from '@core/projects/domain/repository';
import {
    ProjectErrorCodes,
    ProjectErrorMessages,
    ProjectStateErrorCodes,
    ProjectStateErrorMessages,
} from '@core/projects/domain/errors';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { UpdateProjectStateDto } from '../../dtos';

@Injectable()
export class UpdateStateUseCase {
    constructor(
        @Inject('IProjectsRepository')
        private readonly projectsRepo: IProjectsRepository,
        @Inject('IProjectStatesRepository')
        private readonly projectStatesRepo: IProjectStatesRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, stateId: string, dto: UpdateProjectStateDto, userId: string) {
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

        const state = await this.projectStatesRepo.findOne(slug, stateId);

        if (!state) {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.NOT_FOUND,
                    message: ProjectStateErrorMessages[ProjectStateErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (state.isLocked) {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.LOCKED,
                    message: ProjectStateErrorMessages[ProjectStateErrorCodes.LOCKED],
                },
                HttpStatus.CONFLICT,
            );
        }

        if (state.stateType !== 'custom' && dto.stateType === 'custom') {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.SYSTEM_TYPE_IMMUTABLE,
                    message:
                        ProjectStateErrorMessages[ProjectStateErrorCodes.SYSTEM_TYPE_IMMUTABLE],
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const result = await this.projectStatesRepo.update(slug, stateId, dto);

        return {
            success: result,
            message: result
                ? 'Состояние успешно обновлено'
                : 'Не удалось обновить состояние: запись не найдена',
        };
    }
}
