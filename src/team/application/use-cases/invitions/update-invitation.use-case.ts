import { subject } from '@casl/ability';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { AbilityFactory } from '@shared/authorization/ability.factory';
import { Action } from '@shared/authorization/types/action.enum';
import { Subject } from '@shared/authorization/types/subject.enum';
import { ROLE_PRIORITY } from '@shared/constants';
import { TeamRole } from '@shared/entities';
import { BaseException } from '@shared/error';

import { ITeamRepository, RawMemberRow } from '../../../domain/repository';
import { UpdateInvitationDto } from '../../dtos';
import { TeamInvite } from '../../dtos/invitation.dto';

@Injectable()
export class UpdateInvitationUseCase {
    private readonly INVITES_KEY = (code: string) => `inv:code:${code}`;

    constructor(
        @Inject('ITeamRepository') private readonly teamRepo: ITeamRepository,
        @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async execute(teamId: string, code: string, userId: string, dto: UpdateInvitationDto) {
        const key = this.INVITES_KEY(code);

        const { invite, ttlSeconds } = await this.getInviteContextOrThrow(key);
        this.validateInviteOwnership(invite, teamId);

        const member = await this.teamRepo.findMember(teamId, userId);
        if (!member) {
            throw new BaseException(
                {
                    code: 'TEAM_NOT_FOUND_OR_FORBIDDEN',
                    message: `У вас нет прав или команда не найдена`,
                },
                HttpStatus.FORBIDDEN,
            );
        }

        this.validateAccess(member, dto.role);

        const updatedInvite = {
            ...invite,
            role: dto.role,
        };

        await this.cacheService.setOne(key, JSON.stringify(updatedInvite), ttlSeconds);

        return {
            success: true,
            message: 'Роль в приглашении успешно обновлена',
        };
    }

    private validateAccess(member: RawMemberRow, targetRole: TeamRole) {
        const ability = this.abilityFactory.createForTeamMember(member);
        const canUpdateInvites = ability.can(Action.UPDATE, Subject.INVITE);

        if (!canUpdateInvites) {
            throw new BaseException(
                {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'У вас недостаточно прав для обновления приглашений',
                },
                HttpStatus.FORBIDDEN,
            );
        }

        const canAssignCurrentRole = ability.can(
            Action.UPDATE,
            subject(Subject.ROLE, { priority: ROLE_PRIORITY[targetRole] }),
        );

        if (!canAssignCurrentRole) {
            throw new BaseException(
                {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: `У вас недостаточно прав чтобы назначить роль ${targetRole}`,
                },
                HttpStatus.FORBIDDEN,
            );
        }
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
}
