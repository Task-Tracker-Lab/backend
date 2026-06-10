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

@Injectable()
export class DeleteStateUseCase {
    constructor(
        @Inject('IProjectsRepository')
        private readonly projectsRepo: IProjectsRepository,
        @Inject('IProjectStatesRepository')
        private readonly projectStatesRepo: IProjectStatesRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, stateId: string, userId: string) {
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

        if (state.stateType !== 'custom') {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.CANNOT_DELETE_SYSTEM,
                    message: ProjectStateErrorMessages[ProjectStateErrorCodes.CANNOT_DELETE_SYSTEM],
                    details: [{ stateType: state.stateType }],
                },
                HttpStatus.FORBIDDEN,
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

        //  const taskCount = await this.taskRepo.countByState(state.id);
        //  if (taskCount > 0) {
        //      throw new BaseException(
        //          {
        //              code: ProjectStateErrorCodes.HAS_ACTIVE_TASKS,
        //              message: ProjectStateErrorMessages[ProjectStateErrorCodes.HAS_ACTIVE_TASKS],
        //              details: { taskCount },
        //          },
        //          HttpStatus.CONFLICT,
        //      );
        //  }

        const result = await this.projectStatesRepo.delete(slug, stateId);

        return {
            success: result,
            message: result
                ? 'Состояние успешно удалено'
                : 'Не удалось удалить состояние: запись не найдена или уже удалена',
        };
    }
}
