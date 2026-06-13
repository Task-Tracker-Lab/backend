import { MemberErrorCodes, MemberErrorMessages } from '@core/projects/domain/errors/member.errors';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { IMemberRepository } from '@core/projects/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class DeleteProjectMemberUseCase {
    constructor(
        @Inject('IMemberRepository') private readonly memberRepo: IMemberRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, memberId: string, userId: string) {
        const { project, member: currentMember } = await this.policy.ensureProjectAccess(
            slug,
            userId,
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

        const isSelfRemove = targetMember.userId === userId;

        if (targetMember.role === 'owner') {
            throw new BaseException(
                {
                    code: isSelfRemove
                        ? MemberErrorCodes.SELF_REMOVE_OWNER
                        : MemberErrorCodes.CANNOT_REMOVE_OWNER,
                    message: isSelfRemove
                        ? MemberErrorMessages[MemberErrorCodes.SELF_REMOVE_OWNER]
                        : MemberErrorMessages[MemberErrorCodes.CANNOT_REMOVE_OWNER],
                },
                HttpStatus.FORBIDDEN,
            );
        }

        if (!isSelfRemove) {
            if (currentMember.role !== 'owner' && currentMember.role !== 'admin') {
                throw new BaseException(
                    {
                        code: MemberErrorCodes.ACCESS_DENIED,
                        message: MemberErrorMessages[MemberErrorCodes.ACCESS_DENIED],
                    },
                    HttpStatus.FORBIDDEN,
                );
            }

            if (targetMember.role === 'admin' && currentMember.role !== 'owner') {
                throw new BaseException(
                    {
                        code: MemberErrorCodes.ADMIN_REMOVE_FORBIDDEN,
                        message: MemberErrorMessages[MemberErrorCodes.ADMIN_REMOVE_FORBIDDEN],
                    },
                    HttpStatus.FORBIDDEN,
                );
            }
        }

        const deleted = await this.memberRepo.delete(memberId);
        if (!deleted) {
            throw new BaseException(
                {
                    code: MemberErrorCodes.DELETE_FAILED,
                    message: MemberErrorMessages[MemberErrorCodes.DELETE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        const action = isSelfRemove ? 'покинул' : 'удален из';

        return {
            success: true,
            message: `Пользователь ${action} проект «${project.name}»`,
        };
    }
}
