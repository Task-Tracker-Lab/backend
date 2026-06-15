import { Inject } from '@nestjs/common';
import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import * as schema from '../models';
import * as scUsers from '@core/user/infrastructure/persistence/models';
import { and, desc, eq, ilike, isNull } from 'drizzle-orm';
import type { NewTeam, NewTeamMember, Team, TeamMember } from '@core/teams/domain/entities';
import { ITeamsRepository } from '@core/teams/domain/repository';

export class TeamsRepository implements ITeamsRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof schema>,
    ) {}

    public addMember = async (dto: NewTeamMember) => {
        const result = await this.db
            .insert(schema.teamMembers)
            .values(dto)
            .onConflictDoNothing({
                target: [schema.teamMembers.teamId, schema.teamMembers.userId],
            });

        return (result?.count ?? 0) > 0;
    };

    public create = async (ownerId: string, dto: NewTeam) => {
        return this.db.transaction(async (tx) => {
            const [team] = await tx
                .insert(schema.teams)
                .values({ ...dto, ownerId })
                .returning({ teamId: schema.teams.id });

            if (!team?.teamId) {
                throw new Error('Failed to create team: no team returned');
            }

            await tx.insert(schema.teamMembers).values({
                teamId: team.teamId,
                userId: ownerId,
                role: 'owner',
                status: 'active',
                joinedAt: new Date().toISOString(),
            });

            return {
                success: true,
                teamId: team.teamId,
            };
        });
    };

    public update = async (id: string, dto: Partial<Team>) => {
        return this.db.transaction(async (tx) => {
            const [team] = await tx
                .update(schema.teams)
                .set(dto)
                .where(eq(schema.teams.id, id))
                .returning({ teamId: schema.teams.id });

            if (!team?.teamId) {
                throw new Error('Failed to create team: no team returned');
            }

            return {
                success: true,
                teamId: team.teamId,
            };
        });
    };

    public remove = async (teamId: string, userId: string) => {
        const result = await this.db
            .update(schema.teams)
            .set({
                deletedAt: new Date().toISOString(),
            })
            .where(and(eq(schema.teams.id, teamId), eq(schema.teams.ownerId, userId)));

        return (result?.count ?? 0) > 0;
    };

    public findMember = async (teamId: string, userId: string) => {
        const [member] = await this.membersQuery.where(
            and(eq(schema.teamMembers.teamId, teamId), eq(schema.teamMembers.userId, userId)),
        );

        return member || null;
    };

    public findMembers = async (teamId: string) => {
        return this.membersQuery
            .where(eq(schema.teamMembers.teamId, teamId))
            .orderBy(desc(schema.teamMembers.joinedAt));
    };

    public findByUser = async (
        userId: string,
        pagination: { search?: string; limit?: number; offset?: number },
    ) => {
        const { search, limit = 10, offset = 0 } = pagination;

        const filters = [
            eq(schema.teamMembers.userId, userId),
            eq(schema.teamMembers.status, 'active'),
            isNull(schema.teams.deletedAt),
        ];

        if (search) {
            filters.push(ilike(schema.teams.name, `%${search}%`));
        }

        const query = this.db
            .select({
                id: schema.teams.id,
                name: schema.teams.name,
                description: schema.teams.description,
                avatarUrl: schema.teams.avatarUrl,
                role: schema.teamMembers.role,
                joinedAt: schema.teamMembers.joinedAt,
            })
            .from(schema.teamMembers)
            .innerJoin(schema.teams, eq(schema.teams.id, schema.teamMembers.teamId))
            .where(and(...filters))
            .orderBy(desc(schema.teamMembers.joinedAt))
            .limit(limit)
            .offset(offset);

        return query;
    };

    public findById = async (teamId: string) => {
        const [team] = await this.db.select().from(schema.teams).where(eq(schema.teams.id, teamId));
        if (!team) return null;
        return team;
    };

    public removeMember = async (teamId: string, userId: string) => {
        const result = await this.db
            .delete(schema.teamMembers)
            .where(
                and(eq(schema.teamMembers.teamId, teamId), eq(schema.teamMembers.userId, userId)),
            );

        return (result?.count ?? 0) > 0;
    };

    public updateMember = async (teamId: string, userId: string, dto: Partial<TeamMember>) => {
        const { role, status } = dto;

        const data = {
            role,
            ...(status === 'active' ? { joinedAt: new Date().toISOString() } : {}),
        };

        const result = await this.db
            .update(schema.teamMembers)
            .set(data)
            .where(
                and(eq(schema.teamMembers.teamId, teamId), eq(schema.teamMembers.userId, userId)),
            );

        return (result?.count ?? 0) > 0;
    };

    public async updateTeamAvatar(teamId: string, url: string): Promise<boolean> {
        const result = await this.db
            .update(schema.teams)
            .set({ avatarUrl: url, updatedAt: new Date().toISOString() })
            .where(eq(schema.teams.id, teamId));
        return (result?.count ?? 0) > 0;
    }

    public async updateTeamBanner(teamId: string, url: string): Promise<boolean> {
        const result = await this.db
            .update(schema.teams)
            .set({ coverUrl: url, updatedAt: new Date().toISOString() })
            .where(eq(schema.teams.id, teamId));
        return (result?.count ?? 0) > 0;
    }

    private get memberSelection() {
        return {
            userId: schema.teamMembers.userId,
            role: schema.teamMembers.role,
            status: schema.teamMembers.status,
            joinedAt: schema.teamMembers.joinedAt,
            firstName: scUsers.users.firstName,
            lastName: scUsers.users.lastName,
            middleName: scUsers.users.middleName,
            avatarUrl: scUsers.users.avatarUrl,
            email: scUsers.users.email,
        };
    }

    private get membersQuery() {
        return this.db
            .select(this.memberSelection)
            .from(schema.teamMembers)
            .innerJoin(scUsers.users, eq(schema.teamMembers.userId, scUsers.users.id));
    }
}
