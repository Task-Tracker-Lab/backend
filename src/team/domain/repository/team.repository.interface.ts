import type { TeamMembersQuery } from '../../application/dtos';
import type { Team, NewTeam, NewTeamMember } from '../entities';
import type { CursorResult } from '@libs/database';

type TResponse = { success: boolean; teamId: string };

export type RawMemberRow = {
    userId: string;
    role: string;
    status: string;
    joinedAt: string | null;
    firstName: string;
    lastName: string | null;
    middleName: string | null;
    avatarUrl: string | null;
    email?: string;
};

export type RawMemberTeams = {
    id: string;
    name: string;
    description: string | null;
    avatarUrl: string | null;
    role: string;
    joinedAt: string | null;
};

export interface ITeamRepository {
    create(ownerId: string, dto: NewTeam): Promise<TResponse>;
    update(id: string, dto: Partial<NewTeam>): Promise<TResponse>;
    remove(id: string, userId: string): Promise<boolean>;

    findMember(teamId: string, userId: string): Promise<RawMemberRow | null>;
    findMembers(teamId: string, query?: TeamMembersQuery): Promise<CursorResult<RawMemberRow>>;
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
