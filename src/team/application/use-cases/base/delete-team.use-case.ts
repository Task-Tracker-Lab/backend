import { ITeamRepository, RawMemberRow } from '@core/team/domain/repository';
import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import { AbilityFactory } from '@shared/authorization/ability.factory';
import { Action } from '@shared/authorization/types/action.enum';
import { Subject } from '@shared/authorization/types/subject.enum';
import { BaseException } from '@shared/error';

@Injectable()
export class DeleteTeamUseCase {
    constructor(
        @Inject('ITeamRepository')
        private readonly teamRepo: ITeamRepository,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async execute(teamId: string, userId: string) {
        const member = await this.teamRepo.findMember(teamId, userId);

        if (!member) {
            throw new BaseException(
                {
                    code: 'TEAM_NOT_FOUND_OR_FORBIDDEN',
                    message: 'Команда не найдена или у вас нет к ней доступа',
                },
                HttpStatus.FORBIDDEN,
            );
        }
        this.validateAccess(member);

        try {
            const result = await this.teamRepo.remove(teamId, userId);

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

    private validateAccess(member: RawMemberRow) {
        const ability = this.abilityFactory.createForTeamMember(member);
        const isAllow = ability.can(Action.DELETE, Subject.TEAM);

        if (!isAllow) {
            throw new BaseException(
                {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'У вас недостаточно прав',
                },
                HttpStatus.FORBIDDEN,
            );
        }
    }
}
