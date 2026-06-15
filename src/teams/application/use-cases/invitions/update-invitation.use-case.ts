import { TeamMemberPolicy } from '@core/teams/domain/policy';
import { ITeamsRepository } from '@core/teams/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';

import { UpdateInvitationDto } from '../../dtos';
import { TeamInvite } from '../../dtos/invitation.dto';

import type { TeamRole } from '../../../infrastructure/persistence/models';

@Injectable()
export class UpdateInvitationUseCase {
    private readonly INVITES_KEY = (code: string) => `inv:code:${code}`;

    constructor(
        @Inject('ITeamsRepository') private readonly teamsRepo: ITeamsRepository,
        @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
        private readonly policy: TeamMemberPolicy,
    ) {}

    async execute(teamId: string, code: string, userId: string, dto: UpdateInvitationDto) {
        const team = await this.getTeamOrThrow(teamId);
        const member = await this.getMemberOrThrow(team.id, userId);

        const key = this.INVITES_KEY(code);
        const { invite, ttlSeconds } = await this.getInviteContextOrThrow(key);

        this.validateInviteOwnership(invite, team.id);
        this.validatePolicy(member.role as TeamRole, invite.role as TeamRole, dto.role as TeamRole);

        const updatedInvite = {
            ...invite,
            role: dto.role as TeamRole,
        };

        await this.cacheService.setOne(key, JSON.stringify(updatedInvite), ttlSeconds);

        return {
            success: true,
            message: 'Роль в приглашении успешно обновлена',
        };
    }

    private async getTeamOrThrow(teamId: string) {
        const team = await this.teamsRepo.findById(teamId);
        if (!team) {
            throw new BaseException(
                { code: 'TEAM_NOT_FOUND', message: 'Команда не найдена' },
                HttpStatus.NOT_FOUND,
            );
        }
        return team;
    }

    private async getMemberOrThrow(teamId: string, userId: string) {
        const member = await this.teamsRepo.findMember(teamId, userId);
        if (!member) {
            throw new BaseException(
                { code: 'NOT_A_MEMBER', message: 'Вы не член команды' },
                HttpStatus.FORBIDDEN,
            );
        }
        return member;
    }

    private async getInviteContextOrThrow(key: string) {
        const { value, ttlSeconds } = await this.cacheService.getOneWithTtl(key);

        if (!value || ttlSeconds <= 0) {
            throw new BaseException(
                {
                    code: 'INVITE_NOT_FOUND_OR_EXPIRED',
                    message: 'Приглашение не найдено или истекло',
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return { invite: JSON.parse(value) as TeamInvite, ttlSeconds };
    }

    private validateInviteOwnership(invite: TeamInvite, teamId: string) {
        if (invite.teamId !== teamId) {
            throw new BaseException(
                { code: 'INVITE_TEAM_MISMATCH', message: 'Приглашение принадлежит другой команде' },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    private validatePolicy(issuerRole: TeamRole, currentTargetRole: TeamRole, newRole: TeamRole) {
        const canUpdate = this.policy.canAssignRole(issuerRole, currentTargetRole, newRole);

        if (!canUpdate) {
            throw new BaseException(
                {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'У вас недостаточно прав для назначения этой роли',
                },
                HttpStatus.FORBIDDEN,
            );
        }
    }
}
