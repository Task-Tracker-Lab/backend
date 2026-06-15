import type { RawMemberRow, RawMemberTeams } from '../../domain/repository';
import { ImageHelper } from '@shared/utils';

export class TeamMemberMapper {
    public static toDetail(row: RawMemberRow, cdn: string) {
        const { firstName, lastName, middleName, avatarUrl, userId, ...rest } = row;

        const fullName =
            [lastName, firstName, middleName].filter(Boolean).join(' ') || 'Unknown User';

        const avatar = ImageHelper.buildResponsiveUrls(cdn, avatarUrl);

        return {
            id: userId,
            ...rest,
            firstName,
            lastName,
            middleName,
            fullName,
            avatar,
            initials: this.getInitials(firstName, lastName),
        };
    }

    public static toList(rows: readonly RawMemberRow[], cdn: string) {
        return rows.map((row) => this.toDetail(row, cdn));
    }

    public static toUserTeam(data: RawMemberTeams, cdn: string) {
        const { role, avatarUrl, ...row } = data;

        const avatar = ImageHelper.buildResponsiveUrls(cdn, avatarUrl);

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            avatar,
            role: role,
            joinedAt: row.joinedAt,
            permissions: {
                canEdit: ['owner', 'admin'].includes(role),
                canDelete: role === 'owner',
                canManageMembers: ['owner', 'admin'].includes(role),
                canInvite: ['owner', 'admin'].includes(role),
                isOwner: role === 'owner',
            },
        };
    }

    public static toPublicInvite(raw: string | null, code: string) {
        if (!raw) return null;
        try {
            const p = JSON.parse(raw);
            return {
                code,
                teamName: p.teamName,
                teamAvatar: p.teamAvatar ?? null,
                inviterName: p.inviterName,
                role: p.role,
                expiresAt: p.expiresAt,
            };
        } catch {
            return null;
        }
    }

    private static getInitials(fName: string | null, lName: string | null): string {
        const first = fName?.[0] ?? '';
        const last = lName?.[0] ?? '';
        return (first + last).toUpperCase() || '?';
    }
}
