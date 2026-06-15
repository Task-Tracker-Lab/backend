export const TEAM_ROLES = ['owner', 'admin', 'moderator', 'lead', 'member', 'viewer'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const ROLE_PRIORITY: Record<TeamRole, number> = {
    owner: 4,
    admin: 3,
    lead: 2,
    moderator: 2,
    member: 1,
    viewer: 0,
};

export const isTeamRole = (role: string): role is TeamRole => {
    return TEAM_ROLES.includes(role as TeamRole);
};

export const PROJECT_ROLE_PRIORITY: Record<string, number> = {
    owner: 4,
    admin: 3,
    editor: 2,
    member: 1,
    viewer: 0,
};
