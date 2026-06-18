import { ITeamsRepository, RawMemberRow } from '@core/teams/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { AbilityFactory } from '@shared/authorization/ability.factory';
import { Action } from '@shared/authorization/types/action.enum';
import { Subject } from '@shared/authorization/types/subject.enum';
import { BaseException } from '@shared/error';

import type { TeamInvite } from '../../dtos/invitation.dto';

@Injectable()
export class DeleteInvitationUseCase {
    private readonly INVITES_KEY = (code: string) => `inv:code:${code}`;
    private readonly TEAM_INVITES_KEY = (teamId: string) => `team:invites:${teamId}`;
    private readonly USER_INVITES_KEY = (email: string) => `user:invites:${email.toLowerCase()}`;

    constructor(
        @Inject('ITeamsRepository') private readonly teamsRepo: ITeamsRepository,
        @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async execute(teamId: string, code: string, userId: string) {
        const invite = await this.getInviteOrThrow(code);
        this.validateInviteOwnership(invite, teamId);

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

        await this.cleanupInvite(code, teamId, invite.email);

        return {
            success: true,
            message: 'Приглашение успешно удалено',
        };
    }

    private validateAccess(member: RawMemberRow) {
        const ability = this.abilityFactory.createForTeamMember(member);
        const isAllow = ability.can(Action.DELETE, Subject.INVITE);

        if (!isAllow) {
            throw new BaseException(
                {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'У вас нет прав для удаления приглашений',
                },
                HttpStatus.FORBIDDEN,
            );
        }
    }

    private async getInviteOrThrow(code: string) {
        const rawInvite = await this.cacheService.getOne(this.INVITES_KEY(code));
        if (!rawInvite) {
            throw new BaseException(
                { code: 'INVITE_NOT_FOUND', message: 'Приглашение не найдено' },
                HttpStatus.NOT_FOUND,
            );
        }
        return JSON.parse(rawInvite) as TeamInvite;
    }

    private validateInviteOwnership(invite: TeamInvite, teamId: string) {
        if (invite.teamId !== teamId) {
            throw new BaseException(
                { code: 'ACCESS_DENIED', message: 'Ошибка доступа' },
                HttpStatus.FORBIDDEN,
            );
        }
    }

    private async cleanupInvite(code: string, teamId: string, email: string) {
        await this.cacheService
            .transaction()
            .removeOne(this.INVITES_KEY(code))
            .removeOneFromCollection(this.TEAM_INVITES_KEY(teamId), code)
            .removeOneFromCollection(this.USER_INVITES_KEY(email), code)
            .execute();
    }
}
