import { ITeamsRepository } from '@core/teams/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import type { TeamInvite } from '../../dtos/invitation.dto';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';

@Injectable()
export class DeclineInvitationUseCase {
    private readonly INVITES_KEY = (code: string) => `inv:code:${code}`;
    private readonly TEAM_INVITES_KEY = (teamId: string) => `team:invites:${teamId}`;
    private readonly USER_INVITES_KEY = (email: string) => `user:invites:${email.toLowerCase()}`;

    constructor(
        @Inject('ITeamsRepository') private readonly teamsRepo: ITeamsRepository,
        @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
    ) {}

    async execute(teamId: string, code: string, userId: string, userEmail: string) {
        const team = await this.getTeamOrThrow(teamId);
        const invite = await this.getInviteOrThrow(code);

        this.validateInviteOwnership(invite, team.id);

        await this.validateAccess(team.id, userId, userEmail, invite.email);

        await this.cleanupInvite(code, team.id, invite.email);

        return {
            success: true,
            message: 'Приглашение успешно удалено',
        };
    }

    private async validateAccess(
        teamId: string,
        userId: string,
        currentUserEmail: string,
        inviteEmail: string,
    ) {
        if (currentUserEmail.toLowerCase() === inviteEmail.toLowerCase()) {
            return;
        }

        const member = await this.teamsRepo.findMember(teamId, userId);
        if (member && (member.role === 'owner' || member.role === 'admin')) {
            return;
        }

        throw new BaseException(
            {
                code: 'INSUFFICIENT_PERMISSIONS',
                message: 'У вас нет прав для отмены этого приглашения',
            },
            HttpStatus.FORBIDDEN,
        );
    }

    private async getTeamOrThrow(teamId: string) {
        const team = await this.teamsRepo.findById(teamId);
        if (!team)
            throw new BaseException(
                { code: 'TEAM_NOT_FOUND', message: 'Команда не найдена' },
                HttpStatus.NOT_FOUND,
            );
        return team;
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
