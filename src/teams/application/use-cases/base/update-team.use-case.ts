import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import { AbilityFactory } from '@shared/authorization/ability.factory';
import { Action } from '@shared/authorization/types/action.enum';
import { Subject } from '@shared/authorization/types/subject.enum';
import { BaseException } from '@shared/error';

import { ITeamsRepository, RawMemberRow } from '../../../domain/repository';
import { UpdateTeamDto } from '../../dtos';

@Injectable()
export class UpdateTeamUseCase {
    constructor(
        @Inject('ITeamsRepository')
        private readonly teamsRepo: ITeamsRepository,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async execute(teamId: string, userId: string, dto: UpdateTeamDto) {
        const member = await this.teamsRepo.findMember(teamId, userId);

        if (!member) {
            throw new BaseException(
                {
                    code: 'TEAM_NOT_FOUND_OR_FORBIDDEN',
                    message: `У вас нет прав или команда не найдена`,
                },
                HttpStatus.FORBIDDEN,
            );
        }

        this.validateAccess(member);

        try {
            const result = await this.teamsRepo.update(teamId, dto);

            return {
                ...result,
                message: 'Данные команды успешно обновлены',
            };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: 'TEAM_UPDATE_FAILED',
                    message: 'Ошибка при обновлении данных команды',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private validateAccess(member: RawMemberRow) {
        const ability = this.abilityFactory.createForTeamMember(member);
        const isAllow = ability.can(Action.UPDATE, Subject.TEAM);

        if (!isAllow) {
            throw new BaseException(
                {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'У вас нет прав для редактирования этой команды',
                },
                HttpStatus.FORBIDDEN,
            );
        }
    }
}
