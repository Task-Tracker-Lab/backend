import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { ITeamRepository } from '../../../domain/repository';
import { CreateTeamDto } from '../../dtos';

@Injectable()
export class CreateTeamUseCase {
    constructor(
        @Inject('ITeamRepository')
        private readonly teamRepo: ITeamRepository,
    ) {}

    async execute(userId: string, dto: CreateTeamDto) {
        try {
            const result = await this.teamRepo.create(userId, dto);

            return {
                ...result,
                message: 'Команда успешно создана',
            };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: 'TEAM_CREATE_FAILED',
                    message: 'Не удалось создать команду',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
