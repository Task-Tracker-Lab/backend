import { MemberErrorCodes, MemberErrorMessages } from '@core/project/domain/errors';
import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { IMemberRepository } from '@core/project/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { UpdateProjectMemberDto } from '../../dtos';

@Injectable()
export class UpdateProjectMemberUseCase {
    constructor(
        @Inject('IMemberRepository') private readonly memberRepo: IMemberRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, memberId: string, userId: string, dto: UpdateProjectMemberDto) {
        const { project, member: currentMember } = await this.policy.ensureProjectAccess(
            slug,
            userId,
            ['owner', 'admin'],
        );

        const targetMember = await this.memberRepo.findById(memberId);
        if (!targetMember || targetMember.projectId !== project.id) {
            throw new BaseException(
                {
                    code: MemberErrorCodes.NOT_FOUND,
                    message: MemberErrorMessages[MemberErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (targetMember.role === 'owner') {
            throw new BaseException(
                {
                    code: MemberErrorCodes.CANNOT_CHANGE_OWNER,
                    message: MemberErrorMessages[MemberErrorCodes.CANNOT_CHANGE_OWNER],
                },
                HttpStatus.FORBIDDEN,
            );
        }

        if (
            (targetMember.role === 'admin' || dto.role === 'admin') &&
            currentMember.role !== 'owner'
        ) {
            throw new BaseException(
                {
                    code: MemberErrorCodes.ADMIN_CHANGE_FORBIDDEN,
                    message: MemberErrorMessages[MemberErrorCodes.ADMIN_CHANGE_FORBIDDEN],
                },
                HttpStatus.FORBIDDEN,
            );
        }

        if (targetMember.role === dto.role) {
            return {
                success: true,
                message: `Пользователь уже имеет роль «${dto.role}»`,
            };
        }

        const updated = await this.memberRepo.updateRole(memberId, dto.role);
        if (!updated) {
            throw new BaseException(
                {
                    code: MemberErrorCodes.UPDATE_FAILED,
                    message: MemberErrorMessages[MemberErrorCodes.UPDATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return {
            success: true,
            message: `Роль пользователя изменена с «${targetMember.role}» на «${dto.role}» в проекте «${project.name}»`,
        };
    }
}
