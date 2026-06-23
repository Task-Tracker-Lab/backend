import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import { Injectable, Inject } from '@nestjs/common';
import { and, count, eq, gt, isNull, or } from 'drizzle-orm';

import { IProjectRepository } from '../../../domain/repository';
import * as schema from '../models';

import type { NewProject, NewProjectShare } from '@core/project/domain/entities';

@Injectable()
export class ProjectRepository implements IProjectRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof schema>,
    ) {}

    public readonly create = async (userId: string, data: NewProject) => {
        const result = await this.db.transaction(async (tx) => {
            const project = await tx
                .insert(schema.projects)
                .values(data)
                .returning({ slug: schema.projects.slug, id: schema.projects.id });

            if (!project[0]) {
                throw new Error('Failed to create project: no project returned');
            }

            const member = await tx
                .insert(schema.projectMembers)
                .values({
                    projectId: project[0].id,
                    userId,
                    role: 'owner',
                })
                .returning({ id: schema.projectMembers.id });

            return { slug: project[0].slug, result: project.length > 0 && member.length > 0 };
        });

        return result;
    };

    public readonly update = async (
        teamId: string,
        projectId: string,
        data: Partial<NewProject>,
    ) => {
        const result = await this.db
            .update(schema.projects)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(
                and(
                    eq(schema.projects.id, projectId),
                    eq(schema.projects.teamId, teamId),
                    isNull(schema.projects.deletedAt),
                ),
            )
            .returning({ id: schema.projects.id });

        return result.length > 0;
    };

    public readonly delete = async (teamId: string, projectId: string) => {
        const result = await this.db
            .update(schema.projects)
            .set({
                status: 'deleted',
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .where(
                and(
                    eq(schema.projects.id, projectId),
                    eq(schema.projects.teamId, teamId),
                    isNull(schema.projects.deletedAt),
                ),
            )
            .returning({ id: schema.projects.id });

        return result.length > 0;
    };

    public readonly findOne = async (id: string, teamId?: string) => {
        const [project] = await this.db
            .select()
            .from(schema.projects)
            .where(
                and(
                    eq(schema.projects.id, id),
                    isNull(schema.projects.deletedAt),
                    teamId ? eq(schema.projects.teamId, teamId) : undefined,
                ),
            );

        return project || null;
    };

    public readonly findBySlug = async (slug: string, teamId?: string) => {
        const [project] = await this.db
            .select()
            .from(schema.projects)
            .where(
                and(
                    eq(schema.projects.slug, slug),
                    isNull(schema.projects.deletedAt),
                    teamId ? eq(schema.projects.teamId, teamId) : undefined,
                ),
            );

        return project || null;
    };

    public readonly findByTeam = async (teamId: string) =>
        this.db
            .select()
            .from(schema.projects)
            .where(and(eq(schema.projects.teamId, teamId), isNull(schema.projects.deletedAt)));

    public readonly createShare = async (data: NewProjectShare) => {
        const [result] = await this.db
            .insert(schema.projectShares)
            .values(data)
            .onConflictDoUpdate({
                target: schema.projectShares.token,
                set: {
                    expiresAt: data.expiresAt,
                    token: data.token,
                },
            })
            .returning({ id: schema.projectShares.id });

        return !!result;
    };

    public readonly hasValidShareToken = async (id: string, token: string) => {
        const [result] = await this.db
            .select()
            .from(schema.projectShares)
            .where(
                and(
                    eq(schema.projectShares.projectId, id),
                    eq(schema.projectShares.token, token),
                    or(
                        isNull(schema.projectShares.expiresAt),
                        gt(schema.projectShares.expiresAt, new Date().toISOString()),
                    ),
                ),
            )
            .limit(1);

        return !!result;
    };

    public readonly revokeAllShares = async (projectId: string) => {
        const result = await this.db
            .delete(schema.projectShares)
            .where(eq(schema.projectShares.projectId, projectId))
            .returning({ id: schema.projectShares.id });

        return result.length > 0;
    };

    public readonly countByTeam = async (teamId: string) => {
        const [result] = await this.db
            .select({ count: count() })
            .from(schema.projects)
            .where(
                and(
                    eq(schema.projects.teamId, teamId),
                    isNull(schema.projects.deletedAt),
                    eq(schema.projects.status, 'active'),
                ),
            );

        return result?.count ?? 0;
    };

    public readonly checkVisibility = async (slug: string) => {
        const [result] = await this.db
            .select({ visibility: schema.projects.visibility })
            .from(schema.projects)
            .where(and(eq(schema.projects.slug, slug), isNull(schema.projects.deletedAt)));

        return result ?? null;
    };
}
