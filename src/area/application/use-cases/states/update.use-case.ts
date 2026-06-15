import { StateErrorCodes, StateErrorMessages } from '@core/area/domain/errors';
import { IStateRepository } from '@core/area/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { UpdateStateDto } from '../../dtos';
import { GetAreaQuery } from '../areas';

@Injectable()
export class UpdateStateUseCase {
    constructor(
        @Inject('IStateRepository')
        private readonly stateRepo: IStateRepository,
        private readonly getAreaQ: GetAreaQuery,
    ) {}

    async execute(slug: string, stateId: string, dto: UpdateStateDto, userId: string) {
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

            if (state.isLocked) {
                throw new BaseException(
                    {
                        code: StateErrorCodes.LOCKED,
                        message: StateErrorMessages[StateErrorCodes.LOCKED],
                    },
                    HttpStatus.CONFLICT,
                );
            }

            if (state.stateType !== 'custom' && dto.stateType === 'custom') {
                throw new BaseException(
                    {
                        code: StateErrorCodes.SYSTEM_TYPE_IMMUTABLE,
                        message: StateErrorMessages[StateErrorCodes.SYSTEM_TYPE_IMMUTABLE],
                    },
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }

            const result = await this.stateRepo.update(area.id, stateId, dto);

            return {
                success: result,
                message: result
                    ? 'Состояние успешно обновлено'
                    : 'Не удалось обновить состояние: запись не найдена',
            };
        } catch (err) {
            if (err instanceof BaseException) {
                throw err;
            }

            throw new BaseException(
                {
                    code: StateErrorCodes.UPDATE_FAILED,
                    message: StateErrorMessages[StateErrorCodes.UPDATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
