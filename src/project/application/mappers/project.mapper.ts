import type { Project } from '@core/project/domain/entities';
import type { RawMemberRow } from '@core/teams/domain/repository';

export class ProjectMapper {
    public static toDetailResponse(project: Project, member?: RawMemberRow | null, token?: string) {
        const {
            id,
            slug,
            name,
            status,
            description,
            color,
            icon,
            sequence,
            createdAt,
            updatedAt,
            visibility,
        } = project;

        return {
            id,
            slug,
            name,
            status,
            description,
            visuals: {
                color: color || '#3b82f6',
                icon,
            },
            meta: {
                sequence,
                createdAt: new Date(createdAt).toISOString(),
                updatedAt: new Date(updatedAt).toISOString(),
            },
            access: {
                visibility,
                currentUserRole: member?.role || 'viewer',
                shareUrl: visibility === 'public' && token ? `/share/${token}` : null,
            },
            settings: {},
        };
    }

    public static toListResponse(project: Project, member: RawMemberRow) {
        const { id, slug, name, status, color, icon, createdAt } = project;

        return {
            id,
            slug,
            name,
            status,
            color: color || '#3b82f6',
            icon,
            role: member?.role || 'viewer',
            createdAt: new Date(createdAt).toISOString(),
        };
    }
}
