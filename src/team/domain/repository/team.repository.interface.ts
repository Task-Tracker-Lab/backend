import type { TeamRole, TeamMemberStatus } from '../../infrastructure/persistence/models';
import type { Team, NewTeam, NewTeamMember } from '../entities';

type TResponse = { readonly success: boolean; readonly teamId: string };

export type RawMemberRow = {
    readonly userId: string;
    readonly role: TeamRole;
    readonly status: TeamMemberStatus;
    readonly joinedAt: string | null;
    readonly firstName: string | null;
    readonly lastName: string | null;
    readonly middleName: string | null;
    readonly avatarUrl: string | null;
    readonly email?: string;
};

export type RawMemberTeams = {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
    readonly avatarUrl: string | null;
    readonly role: string;
    readonly joinedAt: string | null;
};

export interface ITeamRepository {
    create(ownerId: string, dto: NewTeam): Promise<TResponse>;
    update(id: string, dto: Partial<NewTeam>): Promise<TResponse>;
    remove(id: string, userId: string): Promise<boolean>;

    findMember(teamId: string, userId: string): Promise<RawMemberRow | null>;
    findMembers(teamId: string): Promise<RawMemberRow[]>;
    findById(teamId: string): Promise<Team | null>;
    findByUser(userId: string): Promise<RawMemberTeams[]>;

    updateTeamAvatar(teamId: string, url: string): Promise<boolean>;
    updateTeamBanner(teamId: string, url: string): Promise<boolean>;

    addMember(dto: NewTeamMember): Promise<boolean>;
    updateMember(
        teamId: string,
        userId: string,
        dto: { role?: string; status?: string },
    ): Promise<boolean>;
    removeMember(teamId: string, userId: string): Promise<boolean>;
}
