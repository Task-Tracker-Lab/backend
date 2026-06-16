import { ITeamsRepository } from '@core/teams/domain/repository';
import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class DeleteTeamUseCase {
    constructor(
        @Inject('ITeamsRepository')
        private readonly teamsRepo: ITeamsRepository,
    ) {}

    async execute(teamId: string, userId: string) {
        const team = await this.teamsRepo.findById(teamId);

        if (!team) {
            throw new BaseException(
                {
                    code: 'TEAM_NOT_FOUND',
                    message: `Команда ${teamId} не найдена`,
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const member = await this.teamsRepo.findMember(team.id, userId);
        const isOwner = team.ownerId === userId || member?.role === 'owner';

        if (!isOwner) {
            throw new BaseException(
                {
                    code: 'ONLY_OWNER_CAN_DELETE',
                    message: 'Только владелец может удалить команду',
                },
                HttpStatus.FORBIDDEN,
            );
        }

        try {
            const result = await this.teamsRepo.remove(team.id, userId);

            return {
                success: result,
                message: 'Команда успешно удалена',
            };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: 'TEAM_DELETE_FAILED',
                    message: 'Не удалось удалить команду',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
