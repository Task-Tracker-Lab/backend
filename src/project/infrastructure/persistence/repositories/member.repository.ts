import { IMemberRepository } from '@core/project/domain/repository';
import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';

import * as schema from '../models';

import type { MemberRole } from '@core/project/domain/entities';

@Injectable()
export class MemberRepository implements IMemberRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof schema>,
    ) {}

    public readonly create = async (data: typeof schema.projectMembers.$inferInsert) => {
        const [result] = await this.db
            .insert(schema.projectMembers)
            .values(data)
            .returning({ id: schema.projectMembers.id });

        if (!result) {
            throw new Error('Failed to create member: no member returned');
        }

        return { id: result?.id };
    };

    public readonly findById = async (memberId: string) => {
        const [result] = await this.db
            .select()
            .from(schema.projectMembers)
            .where(eq(schema.projectMembers.id, memberId))
            .limit(1);

        return result ?? null;
    };

    public readonly findByProject = async (projectId: string) =>
        this.db
            .select()
            .from(schema.projectMembers)
            .where(eq(schema.projectMembers.projectId, projectId))
            .orderBy(schema.projectMembers.createdAt);

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

    public readonly findByProjectAndUser = async (projectId: string, userId: string) => {
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

    public readonly getUserRole = async (projectId: string, userId: string) => {
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

    public readonly countByProject = async (projectId: string) => {
        const [result] = await this.db
            .select({ count: sql<number>`count(*)` })
            .from(schema.projectMembers)
            .where(eq(schema.projectMembers.projectId, projectId));

        return result?.count ?? 0;
    };

    public readonly updateRole = async (memberId: string, role: MemberRole) => {
        const [result] = await this.db
            .update(schema.projectMembers)
            .set({ role })
            .where(eq(schema.projectMembers.id, memberId))
            .returning();

        return result ?? null;
    };

    public readonly delete = async (memberId: string) => {
        const [result] = await this.db
            .delete(schema.projectMembers)
            .where(eq(schema.projectMembers.id, memberId))
            .returning({ id: schema.projectMembers.id });

        return result !== undefined;
    };
}
