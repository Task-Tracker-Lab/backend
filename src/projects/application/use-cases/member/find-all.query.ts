import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { IMemberRepository } from '@core/projects/domain/repository';
import { Inject, Injectable } from '@nestjs/common';
import { MemberMapper } from '../../mappers/member.mapper';
import { FindByIdsQuery } from '@core/user/application/use-cases';

@Injectable()
export class FindAllProjectMembersQuery {
    constructor(
        @Inject('IMemberRepository') private readonly memberRepo: IMemberRepository,
        private readonly policy: ProjectAccessPolicy,
        private readonly findUsersQ: FindByIdsQuery,
    ) {}

    async execute(slug: string, userId: string) {
        const { project } = await this.policy.ensureProjectAccess(slug, userId);
        const members = await this.memberRepo.findByProject(project.id);

        const userIds = members.map((m) => m.userId);
        const users = await this.findUsersQ.execute(userIds);

        const map = new Map(users.map((u) => [u.id, u]));
        const result = members
            .map((m) => ({
                ...m,
                user: map.get(m.userId),
            }))
            .filter(
                (item): item is typeof item & { user: NonNullable<typeof item.user> } =>
                    item.user !== undefined,
            );

        return MemberMapper.toMemberListResponse(result);
    }
}
