import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ROLE_PRIORITY, PROJECT_ROLE_PRIORITY } from '@shared/constants';
import { BaseException } from '@shared/error';

import { isTeamRole } from '../../../shared/constants/roles.constant';
import { FindTeamMemberQuery, FindTeamQuery } from '../../../team';
import { ProjectErrorCodes, ProjectErrorMessages } from '../errors';
import { MemberErrorCodes, MemberErrorMessages } from '../errors/member.errors';
import { IMemberRepository, IProjectRepository } from '../repository';

import type { MemberRole } from '../entities';

@Injectable()
export class ProjectAccessPolicy {
    constructor(
        @Inject('IProjectRepository')
        private readonly projectRepo: IProjectRepository,
        @Inject('IMemberRepository')
        private readonly memberRepo: IMemberRepository,
        private readonly findTeamQ: FindTeamQuery,
        private readonly findTeamMemberQ: FindTeamMemberQuery,
    ) {}

    /**
     * Проверка доступа к команде (используется, например, при создании проекта)
     */
    public async ensureTeamAccess(
        teamId: string,
        userId: string,
        minRole: keyof typeof ROLE_PRIORITY = 'viewer',
    ) {
        const team = await this.findTeamQ.execute(teamId);
        if (!team) {
            throw new BaseException(
                { code: 'TEAM_NOT_FOUND', message: 'Команда не найдена' },
                HttpStatus.NOT_FOUND,
            );
        }

        const member = await this.findTeamMemberQ.execute(team.id, userId);
        if (!member) {
            throw new BaseException(
                { code: 'NOT_TEAM_MEMBER', message: 'Вы не участник команды' },
                HttpStatus.FORBIDDEN,
            );
        }

        if (isTeamRole(member.role) && ROLE_PRIORITY[member.role] < ROLE_PRIORITY[minRole]) {
            throw new BaseException(
                {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: `Требуется роль ${minRole} или выше`,
                    details: [{ target: 'role', current: member.role, required: minRole }],
                },
                HttpStatus.FORBIDDEN,
            );
        }

        return { team, member };
    }

    /**
     * Проверка доступа к проекту.
     * Проверяет роль пользователя именно в проекте, а не в команде.
     */
    public async ensureProjectAccess(
        slug: string,
        userId: string,
        minRoles: readonly MemberRole[] = ['viewer'],
    ) {
        const project = await this.projectRepo.findBySlug(slug);
        if (!project) {
            throw new BaseException(
                {
                    code: ProjectErrorCodes.NOT_FOUND,
                    message: ProjectErrorMessages[ProjectErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const member = await this.memberRepo.findByProjectAndUser(project.id, userId);
        if (!member) {
            throw new BaseException(
                {
                    code: MemberErrorCodes.ACCESS_DENIED,
                    message: MemberErrorMessages[MemberErrorCodes.ACCESS_DENIED],
                },
                HttpStatus.FORBIDDEN,
            );
        }

        const hasRole = minRoles.some((role) => {
            if (!isTeamRole(member.role) || !isTeamRole(role)) {
                return false;
            }

            const memberPriority = PROJECT_ROLE_PRIORITY[member.role] ?? -1;
            const rolePriority = PROJECT_ROLE_PRIORITY[role] ?? -1;

            return memberPriority >= rolePriority;
        });

        if (!hasRole) {
            throw new BaseException(
                {
                    code: MemberErrorCodes.INSUFFICIENT_PERMISSIONS,
                    message: `Требуется одна из ролей: ${minRoles.join(', ')}. Ваша роль: ${member.role}`,
                },
                HttpStatus.FORBIDDEN,
            );
        }

        return { project, member };
    }

    /**
     * Проверка доступа к проекту по slug
     */
    public async validateProjectAccessById(
        slug: string,
        userId: string,
        minRole: keyof typeof ROLE_PRIORITY = 'viewer',
    ) {
        const project = await this.projectRepo.findOne(slug);
        if (!project) {
            throw new BaseException(
                { code: 'PROJECT_NOT_FOUND', message: 'Проект не найден' },
                HttpStatus.NOT_FOUND,
            );
        }

        const member = await this.findTeamMemberQ.execute(project.teamId, userId);
        if (!member) {
            throw new BaseException(
                { code: 'NOT_TEAM_MEMBER', message: 'Вы не участник команды' },
                HttpStatus.FORBIDDEN,
            );
        }

        // TODO: replace with project members query
        const isProjectMember = true;
        if (!isProjectMember) {
            throw new BaseException(
                { code: 'ACCESS_DENIED', message: 'Вы не являетесь участником этого проекта' },
                HttpStatus.FORBIDDEN,
            );
        }

        if (isTeamRole(member.role) && ROLE_PRIORITY[member.role] < ROLE_PRIORITY[minRole]) {
            throw new BaseException(
                {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: `Требуется роль ${minRole} или выше`,
                    details: [{ target: 'role', current: member.role, required: minRole }],
                },
                HttpStatus.FORBIDDEN,
            );
        }

        return { project, member };
    }
}
