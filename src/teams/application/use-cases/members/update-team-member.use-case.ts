import { subject } from '@casl/ability';
import { ITeamsRepository, RawMemberRow } from '@core/teams/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AbilityFactory } from '@shared/authorization/ability.factory';
import { Action } from '@shared/authorization/types/action.enum';
import { Subject } from '@shared/authorization/types/subject.enum';
import { ROLE_PRIORITY } from '@shared/constants';
import { TeamRole } from '@shared/entities';
import { BaseException } from '@shared/error';

import { UpdateMemberDto } from '../../dtos';

@Injectable()
export class UpdateTeamMemberUseCase {
    constructor(
        @Inject('ITeamsRepository')
        private readonly teamsRepo: ITeamsRepository,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async execute(
        teamId: string,
        currentUserId: string,
        targetUserId: string,
        dto: UpdateMemberDto,
    ) {
        //TODO: move to policy
        this.isSelfRemoval(currentUserId, targetUserId);

        const member = await this.teamsRepo.findMember(teamId, currentUserId);
        if (!member) {
            throw new BaseException(
                {
                    code: 'TEAM_NOT_FOUND_OR_FORBIDDEN',
                    message: `У вас нет прав или команда не найдена`,
                },
                HttpStatus.FORBIDDEN,
            );
        }

        const targetUser = await this.teamsRepo.findMember(teamId, targetUserId);

        if (!targetUser) {
            throw new BaseException(
                { code: 'MEMBER_NOT_FOUND', message: 'Участник не найден' },
                HttpStatus.NOT_FOUND,
            );
        }

        this.validateAccess(member, targetUser.role, dto);

        try {
            const result = await this.teamsRepo.updateMember(teamId, targetUserId, dto);
            return {
                success: result,
                message: `Данные участника команды  успешно обновлены`,
            };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: 'MEMBER_UPDATE_FAILED',
                    message: 'Ошибка при обновлении данных участника',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private isSelfRemoval(currentUserId: string, targetUserId: string) {
        const isSelf = currentUserId === targetUserId;

        if (isSelf) {
            throw new BaseException(
                {
                    code: 'SELF_EDIT_RESTRICTED',
                    message: 'Вы не можете редактировать свои данные',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    private validateAccess(member: RawMemberRow, targetUserRole: TeamRole, dto: UpdateMemberDto) {
        const ability = this.abilityFactory.createForTeamMember(member);
        const canUpdate = ability.can(
            Action.UPDATE,
            subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY[targetUserRole] }),
        );

        if (!canUpdate) {
            throw new BaseException(
                {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'У вас нет прав на управление этим участником',
                },
                HttpStatus.FORBIDDEN,
            );
        }

        if (dto.role) {
            const canAssignCurrentRole = ability.can(
                Action.UPDATE,
                subject(Subject.ROLE, { priority: ROLE_PRIORITY[dto.role] }),
            );

            if (!canAssignCurrentRole) {
                throw new BaseException(
                    {
                        code: 'INSUFFICIENT_PERMISSIONS',
                        message: `У вас нет прав назначить роль ${dto.role}`,
                    },
                    HttpStatus.FORBIDDEN,
                );
            }
        }

        if (dto.status) {
            const canAssignStatus = ability.can(
                Action.UPDATE,
                subject(Subject.STATUS, { priority: ROLE_PRIORITY[targetUserRole] }),
            );

            if (!canAssignStatus) {
                throw new BaseException(
                    {
                        code: 'INSUFFICIENT_PERMISSIONS',
                        message: `У вас нет прав назначить статус этому участнику`,
                    },
                    HttpStatus.FORBIDDEN,
                );
            }
        }
    }
}
