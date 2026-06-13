import { ProjectStateErrorCodes, ProjectStateErrorMessages } from '@core/area/domain/errors';
import { IStateRepository } from '@core/area/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { GetAreaQuery } from '../areas';

@Injectable()
export class DeleteStateUseCase {
    constructor(
        @Inject('IStateRepository')
        private readonly stateRepo: IStateRepository,
        private readonly getAreaQ: GetAreaQuery,
    ) {}

    async execute(slug: string, stateId: string, userId: string) {
        const area = await this.getAreaQ.execute('projectSlug', slug, userId);

        const state = await this.stateRepo.findOne(area.id, stateId);
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

        const result = await this.stateRepo.delete(slug, stateId);

        return {
            success: result,
            message: result
                ? 'Состояние успешно удалено'
                : 'Не удалось удалить состояние: запись не найдена или уже удалена',
        };
    }
}
