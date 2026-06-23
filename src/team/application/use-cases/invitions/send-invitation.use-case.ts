import { subject } from '@casl/ability';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { AbilityFactory } from '@shared/authorization/ability.factory';
import { Action } from '@shared/authorization/types/action.enum';
import { Subject } from '@shared/authorization/types/subject.enum';
import { ROLE_PRIORITY } from '@shared/constants';
import { BaseException } from '@shared/error';
import { ImageHelper } from '@shared/utils';
import { Queue } from 'bullmq';
import { generateSecret } from 'otplib';

import { TeamMailJobs, TeamQueues } from '../../../domain/enums';
import { TeamInvitationEvent } from '../../../domain/events';
import { ITeamRepository, RawMemberRow } from '../../../domain/repository';
import { InviteMemberDto, type TeamInvite } from '../../dtos';

import type { Team } from '../../../domain/entities';
import type { TeamRole } from '@shared/entities';

@Injectable()
export class SendInvitationUseCase {
    private readonly INVITE_TTL = 86400;
    private readonly INVITES_KEY = (code: string) => `inv:code:${code}`;
    private readonly TEAM_INVITES_KEY = (teamId: string) => `team:invites:${teamId}`;
    private readonly USER_INVITES_KEY = (email: string) => `user:invites:${email.toLowerCase()}`;

    constructor(
        @Inject('ITeamRepository') private readonly teamRepo: ITeamRepository,
        @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
        @InjectQueue(TeamQueues.TEAM_MAIL) private readonly mailQueue: Queue,
        private readonly cfg: ConfigService,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async execute(teamId: string, inviterId: string, dto: InviteMemberDto) {
        const team = await this.getTeamOrThrow(teamId);
        const inviter = await this.getInviterOrThrow(teamId, inviterId);

        this.validateAccess(inviter, dto.role);

        await this.ensureNotAlreadyMember(teamId, dto.email);
        await this.ensureNoPendingInvite(teamId, dto.email);

        const code = generateSecret({ length: 8 });
        const inviteData = this.buildInviteData(team, inviter, dto);

        await this.saveInviteToCache(code, inviteData);

        await this.sendEmailNotification(code, team.name, dto.email);

        return { success: true, message: `Приглашение отправлено на ${dto.email.toLowerCase()}` };
    }

    private async getTeamOrThrow(teamId: string) {
        const team = await this.teamRepo.findById(teamId);
        if (!team) {
            throw new BaseException(
                { code: 'TEAM_NOT_FOUND', message: 'Команда не найдена' },
                HttpStatus.NOT_FOUND,
            );
        }
        return team;
    }

    private async getInviterOrThrow(teamId: string, userId: string) {
        const inviter = await this.teamRepo.findMember(teamId, userId);
        if (!inviter) {
            throw new BaseException(
                { code: 'NOT_A_MEMBER', message: 'Вы не член команды' },
                HttpStatus.FORBIDDEN,
            );
        }
        return inviter;
    }

    private validateAccess(member: RawMemberRow, targetRole: TeamRole) {
        const ability = this.abilityFactory.createForTeamMember(member);
        const canInvite = ability.can(Action.CREATE, Subject.INVITE);
        const canAssignRole = ability.can(
            Action.CREATE,
            subject(Subject.ROLE, { priority: ROLE_PRIORITY[targetRole] }),
        );

        if (!canInvite) {
            throw new BaseException(
                {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'Недостаточно прав чтобы приглашать пользователей в команду',
                },
                HttpStatus.FORBIDDEN,
            );
        }

        if (!canAssignRole) {
            throw new BaseException(
                {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: `Недостаточно прав чтобы пригласить пользователя в команду с ролью ${targetRole}`,
                },
                HttpStatus.FORBIDDEN,
            );
        }
    }

    private async ensureNotAlreadyMember(teamId: string, email: string) {
        const member = await this.teamRepo.findMember(teamId, email); // Тут лучше искать по email в репо
        if (member) {
            throw new BaseException(
                { code: 'ALREADY_MEMBER', message: 'Уже в команде' },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    private async ensureNoPendingInvite(teamId: string, email: string) {
        const activeCodes = await this.cacheService.getCollection(this.USER_INVITES_KEY(email));
        if (activeCodes.length === 0) {
            return;
        }

        const invitesData = await this.cacheService.getMany(activeCodes.map(this.INVITES_KEY));
        const hasDuplicate = invitesData
            .filter((d): d is string => !!d)
            .map((d) => JSON.parse(d) as TeamInvite)
            .some((i) => i.teamId === teamId);

        if (hasDuplicate) {
            throw new BaseException(
                { code: 'INVITATION_ALREADY_SENT', message: 'Приглашение уже в пути' },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    private buildInviteData(team: Team, inviter: RawMemberRow, dto: InviteMemberDto): TeamInvite {
        const expiresAt = new Date(Date.now() + this.INVITE_TTL * 1000);

        const images = ImageHelper.responsive(this.cfg, team.avatarUrl);

        return {
            teamId: team.id,
            teamName: team.name,
            teamAvatar: images?.small ?? null,
            email: dto.email.toLowerCase(),
            role: (dto.role || 'member') as TeamRole,
            inviterId: inviter.userId,
            inviterName: inviter.firstName,
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
        };
    }

    private async saveInviteToCache(code: string, data: TeamInvite) {
        await this.cacheService
            .transaction()
            .setOne(this.INVITES_KEY(code), JSON.stringify(data), this.INVITE_TTL)
            .addOneToCollection(this.TEAM_INVITES_KEY(data.teamId), code)
            .addOneToCollection(this.USER_INVITES_KEY(data.email), code)
            .execute();
    }

    private async sendEmailNotification(code: string, teamName: string, email: string) {
        const origins = this.cfg.get<readonly string[]>('CORS_ALLOWED_ORIGINS') || [];
        const url = `${origins[0]}/invites/accept?code=${code}`;
        const event = new TeamInvitationEvent(email, teamName, url);

        await this.mailQueue.add(TeamMailJobs.SEND_TEAM_INVITATION, event, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
        });
    }
}
