import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { IMemberRepository } from '@core/projects/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { AddProjectMemberDto } from '../../dtos';
import { MemberErrorCodes, MemberErrorMessages } from '@core/projects/domain/errors';
import { FindTeamMemberQuery } from '@core/teams';
import { MAX_MEMBERS_PER_PROJECT } from '@core/projects/infrastructure/constants';

@Injectable()
export class AddProjectMemberUseCase {
    constructor(
        @Inject('IMemberRepository') private readonly memberRepo: IMemberRepository,
        private readonly findTeamMemberQ: FindTeamMemberQuery,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, userId: string, dto: AddProjectMemberDto) {
        const { project } = await this.policy.ensureProjectAccess(slug, userId, ['owner', 'admin']);

        if (dto.userId === userId) {
            throw new BaseException(
                {
                    code: MemberErrorCodes.SELF_ADD,
                    message: MemberErrorMessages[MemberErrorCodes.SELF_ADD],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        if (dto.userId === userId) {
            throw new BaseException(
                {
                    code: MemberErrorCodes.SELF_ADD,
                    message: MemberErrorMessages[MemberErrorCodes.SELF_ADD],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const teamMember = await this.findTeamMemberQ.execute(project.teamId, dto.userId);
        if (!teamMember) {
            throw new BaseException(
                {
                    code: MemberErrorCodes.NOT_IN_TEAM,
                    message: MemberErrorMessages[MemberErrorCodes.NOT_IN_TEAM],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const existing = await this.memberRepo.findByProjectAndUser(project.id, dto.userId);
        if (existing) {
            throw new BaseException(
                {
                    code: MemberErrorCodes.ALREADY_EXISTS,
                    message: MemberErrorMessages[MemberErrorCodes.ALREADY_EXISTS],
                },
                HttpStatus.CONFLICT,
            );
        }

        const currentCount = await this.memberRepo.countByProject(project.id);
        // TODO: project.settings?.maxMembers ?? MAX_MEMBERS_PER_PROJECT
        if (currentCount >= MAX_MEMBERS_PER_PROJECT) {
            throw new BaseException(
                {
                    code: MemberErrorCodes.LIMIT_REACHED,
                    message: MemberErrorMessages[MemberErrorCodes.LIMIT_REACHED],
                },
                HttpStatus.FORBIDDEN,
            );
        }

        const { id } = await this.memberRepo.create({
            projectId: project.id,
            userId: dto.userId,
            role: dto.role,
            addedBy: userId,
        });

        return {
            success: true,
            memberId: id,
            message: `Пользователь добавлен в проект «${project.name}» с ролью ${dto.role}`,
        };
    }
}
