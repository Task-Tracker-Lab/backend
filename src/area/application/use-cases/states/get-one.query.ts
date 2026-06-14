import { StateErrorCodes, StateErrorMessages } from '@core/area/domain/errors';
import { IStateRepository } from '@core/area/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { GetAreaQuery } from '../areas';

@Injectable()
export class GetStateQuery {
    constructor(
        @Inject('IStateRepository')
        private readonly stateRepo: IStateRepository,
        private readonly getAreaQ: GetAreaQuery,
    ) {}

    async execute(slug: string, stateId: string, userId: string) {
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

        return {
            ...state,
            createdAt: new Date(state.createdAt).toISOString(),
            updatedAt: new Date(state.updatedAt).toISOString(),
        };
    }
}
