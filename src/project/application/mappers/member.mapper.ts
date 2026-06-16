import type { MemberWithUser } from '@core/project/domain/entities';

export class MemberMapper {
    public static toMemberResponse(member: MemberWithUser) {
        return {
            id: member.id,
            role: member.role,
            createdAt: new Date(member.createdAt).toISOString(),
            user: {
                id: member.user.id,
                email: member.user.email,
                firstName: member.user.firstName,
                lastName: member.user.lastName,
                avatarUrl: member.user.avatarUrl,
            },
        };
    }

    public static toMemberListResponse(members: readonly MemberWithUser[]) {
        const items = members.map(MemberMapper.toMemberResponse);

        return {
            items,
            meta: {
                hasNextPage: false,
                hasPrevPage: false,
                total: items.length,
                totalPages: 1,
                page: 1,
                limit: items.length,
            },
        };
    }
}
