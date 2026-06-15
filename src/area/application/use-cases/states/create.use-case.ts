import { StateErrorCodes, StateErrorMessages } from '@core/area/domain/errors';
import { IStateRepository } from '@core/area/domain/repository';
import { MAX_STATES_PER_PROJECT } from '@core/area/infrastructure/constants';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { CreateStateDto } from '../../dtos';
import { GetAreaQuery } from '../areas';

@Injectable()
export class CreateStateUseCase {
    constructor(
        @Inject('IStateRepository')
        private readonly stateRepo: IStateRepository,
        private readonly getAreaQ: GetAreaQuery,
    ) {}

    async execute(slug: string, dto: CreateStateDto, userId: string) {
        try {
            const area = await this.getAreaQ.execute({ key: slug }, userId);

            const currentCount = await this.stateRepo.countByArea(area.id);
            if (currentCount >= MAX_STATES_PER_PROJECT) {
                throw new BaseException(
                    {
                        code: StateErrorCodes.MAX_LIMIT_REACHED,
                        message: StateErrorMessages[StateErrorCodes.MAX_LIMIT_REACHED],
                        details: [{ current: currentCount, max: MAX_STATES_PER_PROJECT }],
                    },
                    HttpStatus.UNPROCESSABLE_ENTITY,
                );
            }

            if (dto.title) {
                const existingByTitle = await this.stateRepo.findByTitle(area.id, dto.title);

                if (existingByTitle) {
                    throw new BaseException(
                        {
                            code: StateErrorCodes.DUPLICATE_TITLE,
                            message: StateErrorMessages[StateErrorCodes.DUPLICATE_TITLE],
                            details: [{ title: dto.title }],
                        },
                        HttpStatus.CONFLICT,
                    );
                }
            }

            if (dto.stateType && dto.stateType !== 'custom') {
                const existingByType = await this.stateRepo.findByType(area.id, dto.stateType);

                if (existingByType) {
                    throw new BaseException(
                        {
                            code: StateErrorCodes.DUPLICATE_TYPE,
                            message: StateErrorMessages[StateErrorCodes.DUPLICATE_TYPE],
                            details: [{ stateType: dto.stateType }],
                        },
                        HttpStatus.CONFLICT,
                    );
                }
            }

            const result = await this.stateRepo.create({
                ...dto,
                areaId: area.id,
                createdBy: userId,
            });

            return {
                success: true,
                message: 'Состояние успешно создано',
                stateId: result.id,
            };
        } catch (err) {
            if (err instanceof BaseException) {
                throw err;
            }

            throw new BaseException(
                {
                    code: StateErrorCodes.CREATE_FAILED,
                    message: StateErrorMessages[StateErrorCodes.CREATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
