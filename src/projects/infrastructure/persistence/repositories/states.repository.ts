import { Inject, Injectable } from '@nestjs/common';
import { IProjectStatesRepository } from '@core/projects/domain/repository';
import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import * as schema from '../models';
import { and, count, eq, isNotNull, isNull } from 'drizzle-orm';
import type { NewProjectState } from '@core/projects/domain/entities';

@Injectable()
export class ProjectStatesRepository implements IProjectStatesRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof schema>,
    ) {}

    public async create(data: NewProjectState) {
        const [result] = await this.db
            .insert(schema.projectStates)
            .values(data)
            .returning({ id: schema.projectStates.id });

        return result;
    }

    public async delete(projectId: string, stateId: string) {
        const result = await this.db
            .delete(schema.projectStates)
            .where(
                and(
                    eq(schema.projectStates.id, stateId),
                    eq(schema.projectStates.projectId, projectId),
                    isNotNull(schema.projectStates.deletedAt),
                ),
            );

        return (result.count ?? 0) > 0;
    }

    public async find(query: unknown) {
        void query;
        return this.db.select().from(schema.projectStates);
    }

    public async findOne(projectId: string, stateId: string, deleted?: boolean) {
        const [result] = await this.db
            .select()
            .from(schema.projectStates)
            .where(
                and(
                    eq(schema.projectStates.id, stateId),
                    eq(schema.projectStates.projectId, projectId),
                    deleted
                        ? isNotNull(schema.projectStates.deletedAt)
                        : isNull(schema.projectStates.deletedAt),
                ),
            );

        return result ?? null;
    }

    public async update(projectId: string, stateId: string, data: Partial<NewProjectState>) {
        const result = await this.db
            .update(schema.projectStates)
            .set(data)
            .where(
                and(
                    eq(schema.projectStates.id, stateId),
                    eq(schema.projectStates.projectId, projectId),
                    isNull(schema.projectStates.deletedAt),
                ),
            );

        return (result.count ?? 0) > 0;
    }

    public async findByStateType(
        projectId: string,
        // TODO: ADD BASE ENUM TOO
        stateType: 'custom' | 'archived' | 'backlog' | 'todo' | 'in_progress' | 'review' | 'done',
    ) {
        const [result] = await this.db
            .select()
            .from(schema.projectStates)
            .where(
                and(
                    eq(schema.projectStates.projectId, projectId),
                    eq(schema.projectStates.stateType, stateType),
                    isNull(schema.projectStates.deletedAt),
                ),
            );

        return result ?? null;
    }

    public async findByTitle(projectId: string, title: string) {
        const [result] = await this.db
            .select()
            .from(schema.projectStates)
            .where(
                and(
                    eq(schema.projectStates.projectId, projectId),
                    eq(schema.projectStates.title, title),
                    isNull(schema.projectStates.deletedAt),
                ),
            );

        return result ?? null;
    }

    public async countByProject(projectId: string) {
        const [result] = await this.db
            .select({ count: count() })
            .from(schema.projectStates)
            .where(
                and(
                    eq(schema.projectStates.projectId, projectId),
                    isNull(schema.projectStates.deletedAt),
                ),
            );

        return result.count;
    }
}
