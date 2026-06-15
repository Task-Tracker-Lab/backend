import { StateErrorCodes, StateErrorMessages } from '@core/area/domain/errors';
import { IStateRepository } from '@core/area/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { ReordersStatesDto } from '../../dtos';
import { GetAreaQuery } from '../areas';

@Injectable()
export class ReorderStateUseCase {
    constructor(
        @Inject('IStateRepository')
        private readonly stateRepo: IStateRepository,
        private readonly getAreaQ: GetAreaQuery,
    ) {}

    async execute(slug: string, _dto: ReordersStatesDto, userId: string) {
        try {
            const area = await this.getAreaQ.execute({ key: slug }, userId);

            const state = await this.stateRepo.findOne(area.id, slug);

            if (!state) {
                throw new BaseException(
                    {
                        code: StateErrorCodes.NOT_FOUND,
                        message: StateErrorMessages[StateErrorCodes.NOT_FOUND],
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            const result = true;

            return {
                success: result,
                message: result
                    ? 'Состояние успешно восстановлено'
                    : 'Не удалось восстановить состояние: запись не найдена или уже активна',
            };
        } catch (err) {
            if (err instanceof BaseException) {
                throw err;
            }

            throw new BaseException(
                {
                    code: StateErrorCodes.REORDER_FAILED,
                    message: StateErrorMessages[StateErrorCodes.REORDER_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
