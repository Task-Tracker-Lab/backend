import type { TeamRole } from '@core/teams/infrastructure/persistence/models';

export const TEAM_ROLES = ['owner', 'admin', 'member', 'viewer'] as const;

export const ROLE_PRIORITY: Record<TeamRole, number> = {
    owner: 4,
    admin: 3,
    member: 1,
    viewer: 0,
};

export const isTeamRole = (role: string): role is TeamRole => TEAM_ROLES.includes(role as TeamRole);

export const PROJECT_ROLE_PRIORITY: Record<string, number> = {
    owner: 4,
    admin: 3,
    editor: 2,
    member: 1,
    viewer: 0,
};
