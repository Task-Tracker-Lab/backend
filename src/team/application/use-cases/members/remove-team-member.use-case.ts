import { subject } from '@casl/ability';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AbilityFactory } from '@shared/authorization/ability.factory';
import { Action } from '@shared/authorization/types/action.enum';
import { Subject } from '@shared/authorization/types/subject.enum';
import { ROLE_PRIORITY } from '@shared/constants';
import { BaseException } from '@shared/error';

import { ITeamRepository, RawMemberRow } from '../../../domain/repository';

import type { TeamRole } from '@shared/entities';

@Injectable()
export class RemoveTeamMemberUseCase {
    constructor(
        @Inject('ITeamRepository')
        private readonly teamRepo: ITeamRepository,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async execute(teamId: string, currentUserId: string, targetUserId: string) {
        //TODO: move to policy
        this.isSelfRemoval(currentUserId, targetUserId);

        const member = await this.teamRepo.findMember(teamId, currentUserId);
        if (!member) {
            throw new BaseException(
                {
                    code: 'TEAM_NOT_FOUND_OR_FORBIDDEN',
                    message: `У вас нет прав или команда не найдена`,
                },
                HttpStatus.FORBIDDEN,
            );
        }

        const targetUser = await this.teamRepo.findMember(teamId, targetUserId);

        if (!targetUser) {
            throw new BaseException(
                { code: 'MEMBER_NOT_FOUND', message: 'Участник не найден' },
                HttpStatus.NOT_FOUND,
            );
        }

        this.validateAccess(member, targetUser.role);

        try {
            const success = await this.teamRepo.removeMember(teamId, targetUserId);
            if (!success) {
                this.errorDuringRemoving();
            }

            return {
                success: true,
                message: `Участник успешно исключен из команды`,
            };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            return this.errorDuringRemoving();
        }
    }

    private errorDuringRemoving() {
        throw new BaseException(
            { code: 'MEMBER_REMOVAL_FAILED', message: 'Ошибка при удалении участника' },
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    private isSelfRemoval(currentUserId: string, targetUserId: string) {
        const isSelf = currentUserId === targetUserId;

        if (isSelf) {
            throw new BaseException(
                { code: 'INSUFFICIENT_PERMISSIONS', message: 'Вы не можете удалить самого себя' },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    private validateAccess(member: RawMemberRow, targetUserRole: TeamRole) {
        const ability = this.abilityFactory.createForTeamMember(member);
        const isAllow = ability.can(
            Action.DELETE,
            subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY[targetUserRole] }),
        );

        if (!isAllow) {
            throw new BaseException(
                {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'У вас нет прав для удаления этого участника команды',
                },
                HttpStatus.FORBIDDEN,
            );
        }
    }
}
