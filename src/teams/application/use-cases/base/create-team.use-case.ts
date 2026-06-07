import { ITeamsRepository } from '@core/teams/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateTeamDto } from '../../dtos';
import { BaseException } from '@shared/error';

@Injectable()
export class CreateTeamUseCase {
    constructor(
        @Inject('ITeamsRepository')
        private readonly teamsRepo: ITeamsRepository,
    ) {}

    async execute(userId: string, dto: CreateTeamDto) {
        try {
            const result = await this.teamsRepo.create(userId, dto);

            return {
                ...result,
                message: 'Команда успешно создана',
            };
        } catch (error) {
            if (error instanceof BaseException) throw error;

            throw new BaseException(
                {
                    code: 'TEAM_CREATE_FAILED',
                    message: 'Не удалось создать команду',
                    details: [{ reason: error instanceof Error ? error.message : 'Unknown error' }],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
