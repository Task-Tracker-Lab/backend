import { StateErrorCodes, StateErrorMessages } from '@core/area/domain/errors';
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
        try {
            const area = await this.getAreaQ.execute({ key: slug }, userId);

            const state = await this.stateRepo.findOne(area.id, stateId);
            if (!state) {
                throw new BaseException(
                    {
                        code: StateErrorCodes.NOT_FOUND,
                        message: StateErrorMessages[StateErrorCodes.NOT_FOUND],
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            if (state.stateType !== 'custom') {
                throw new BaseException(
                    {
                        code: StateErrorCodes.CANNOT_DELETE_SYSTEM,
                        message: StateErrorMessages[StateErrorCodes.CANNOT_DELETE_SYSTEM],
                        details: [{ stateType: state.stateType }],
                    },
                    HttpStatus.FORBIDDEN,
                );
            }

            if (state.isLocked) {
                throw new BaseException(
                    {
                        code: StateErrorCodes.LOCKED,
                        message: StateErrorMessages[StateErrorCodes.LOCKED],
                    },
                    HttpStatus.CONFLICT,
                );
            }

            //  const taskCount = await this.taskRepo.countByState(state.id);
            //  if (taskCount > 0) {
            //      throw new BaseException(
            //          {
            //              code: StateErrorCodes.HAS_ACTIVE_TASKS,
            //              message: StateErrorMessages[StateErrorCodes.HAS_ACTIVE_TASKS],
            //              details: { taskCount },
            //          },
            //          HttpStatus.CONFLICT,
            //      );
            //  }

            const result = await this.stateRepo.delete(area.id, state.id);

            return {
                success: result,
                message: result
                    ? 'Состояние успешно удалено'
                    : 'Не удалось удалить состояние: запись не найдена или уже удалена',
            };
        } catch (err) {
            if (err instanceof BaseException) {
                throw err;
            }

            throw new BaseException(
                {
                    code: StateErrorCodes.DELETE_FAILED,
                    message: StateErrorMessages[StateErrorCodes.DELETE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
