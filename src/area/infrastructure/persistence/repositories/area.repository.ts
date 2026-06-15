import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import * as schema from '../models';
import { and, count, eq, isNotNull, isNull } from 'drizzle-orm';
import { IAreaRepository } from '@core/area/domain/repository';
import type { NewArea } from '@core/area/domain/entities';
import { DEFAULT_STATES } from '../../constants';

@Injectable()
export class AreaRepository implements IAreaRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof schema>,
    ) {}

    public async create(data: NewArea) {
        const result = await this.db.transaction(async (tx) => {
            const [area] = await tx
                .insert(schema.areas)
                .values(data)
                .returning({ id: schema.areas.id, slug: schema.areas.slug });

            if (!area) {
                throw new Error('Failed to create area: no area returned');
            }

            const statesData = DEFAULT_STATES.map((state) => ({
                areaId: area.id,
                title: state.title,
                type: state.type,
                category: state.category,
                position: state.position,
                color: state.color,
                createdBy: data.createdBy,
            }));

            await tx.insert(schema.states).values(statesData);

            return { slug: area.slug };
        });

        return result;
    }

    public async update(projectId: string, areaId: string, data: Partial<NewArea>) {
        const result = await this.db
            .update(schema.areas)
            .set({ ...data, updatedAt: new Date().toISOString() })
            .where(
                and(
                    eq(schema.areas.id, areaId),
                    eq(schema.areas.projectId, projectId),
                    isNull(schema.areas.deletedAt),
                ),
            );

        return (result.count ?? 0) > 0;
    }

    public async delete(projectId: string, areaId: string) {
        const result = await this.db
            .update(schema.areas)
            .set({ deletedAt: new Date().toISOString() })
            .where(
                and(
                    eq(schema.areas.id, areaId),
                    eq(schema.areas.projectId, projectId),
                    isNull(schema.areas.deletedAt),
                ),
            );

        return (result.count ?? 0) > 0;
    }

    public async findOne(projectId: string, areaId: string, includeDeleted = false) {
        const [result] = await this.db
            .select()
            .from(schema.areas)
            .where(
                and(
                    eq(schema.areas.id, areaId),
                    eq(schema.areas.projectId, projectId),
                    includeDeleted
                        ? isNotNull(schema.areas.deletedAt)
                        : isNull(schema.areas.deletedAt),
                ),
            );

        return result || null;
    }

    public async findAll(projectId: string, includeDeleted = false) {
        return this.db
            .select()
            .from(schema.areas)
            .where(
                and(
                    eq(schema.areas.projectId, projectId),
                    includeDeleted
                        ? isNotNull(schema.areas.deletedAt)
                        : isNull(schema.areas.deletedAt),
                ),
            )
            .orderBy(schema.areas.position);
    }

    public async findBySlug(slug: string, projectId?: string) {
        const [result] = await this.db
            .select()
            .from(schema.areas)
            .where(
                and(
                    projectId ? eq(schema.areas.projectId, projectId) : undefined,
                    eq(schema.areas.slug, slug),
                    isNull(schema.areas.deletedAt),
                ),
            );

        return result || null;
    }

    public async countByProject(projectId: string): Promise<number> {
        const [result] = await this.db
            .select({ count: count().mapWith(Number) })
            .from(schema.areas)
            .where(and(eq(schema.areas.projectId, projectId), isNull(schema.areas.deletedAt)));

        return result?.count ?? 0;
    }
}
