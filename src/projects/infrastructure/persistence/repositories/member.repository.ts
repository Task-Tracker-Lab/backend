import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import { Inject, Injectable } from '@nestjs/common';
import * as schema from '../models';
import { and, eq, sql } from 'drizzle-orm';
import type { MemberRole } from '@core/projects/domain/entities';
import { IMemberRepository } from '@core/projects/domain/repository';

@Injectable()
export class MemberRepository implements IMemberRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof schema>,
    ) {}

    public create = async (data: typeof schema.projectMembers.$inferInsert) => {
        const [result] = await this.db
            .insert(schema.projectMembers)
            .values(data)
            .returning({ id: schema.projectMembers.id });

        if (!result) {
            throw new Error('Failed to create member: no member returned');
        }

        return { id: result?.id };
    };

    public findById = async (memberId: string) => {
        const [result] = await this.db
            .select()
            .from(schema.projectMembers)
            .where(eq(schema.projectMembers.id, memberId))
            .limit(1);

        return result ?? null;
    };

    public findByProject = async (projectId: string) => {
        return this.db
            .select()
            .from(schema.projectMembers)
            .where(eq(schema.projectMembers.projectId, projectId))
            .orderBy(schema.projectMembers.createdAt);
    };

    async isMember(projectId: string, userId: string) {
        const [result] = await this.db
            .select({ one: sql<number>`1` })
            .from(schema.projectMembers)
            .where(
                and(
                    eq(schema.projectMembers.projectId, projectId),
                    eq(schema.projectMembers.userId, userId),
                ),
            )
            .limit(1);

        return result !== undefined;
    }

    public findByProjectAndUser = async (projectId: string, userId: string) => {
        const [result] = await this.db
            .select()
            .from(schema.projectMembers)
            .where(
                and(
                    eq(schema.projectMembers.projectId, projectId),
                    eq(schema.projectMembers.userId, userId),
                ),
            );

        return result || null;
    };

    public getUserRole = async (projectId: string, userId: string) => {
        const [result] = await this.db
            .select({ role: schema.projectMembers.role })
            .from(schema.projectMembers)
            .where(
                and(
                    eq(schema.projectMembers.projectId, projectId),
                    eq(schema.projectMembers.userId, userId),
                ),
            )
            .limit(1);

        return (result?.role as MemberRole) ?? null;
    };

    public countByProject = async (projectId: string) => {
        const [result] = await this.db
            .select({ count: sql<number>`count(*)` })
            .from(schema.projectMembers)
            .where(eq(schema.projectMembers.projectId, projectId));

        return result?.count ?? 0;
    };

    public updateRole = async (memberId: string, role: MemberRole) => {
        const [result] = await this.db
            .update(schema.projectMembers)
            .set({ role })
            .where(eq(schema.projectMembers.id, memberId))
            .returning();

        return result ?? null;
    };

    public delete = async (memberId: string) => {
        const [result] = await this.db
            .delete(schema.projectMembers)
            .where(eq(schema.projectMembers.id, memberId))
            .returning({ id: schema.projectMembers.id });

        return result !== undefined;
    };
}
