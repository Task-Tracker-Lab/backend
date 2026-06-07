import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import * as schema from '../models/identities.model';
import { Inject, Injectable } from '@nestjs/common';
import { IIdentitiesRepository } from '@core/auth/domain/repository';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class IdentitiesRepository implements IIdentitiesRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof schema>,
    ) {}

    public async create(data: typeof schema.userIdentities.$inferInsert) {
        const [result] = await this.db.insert(schema.userIdentities).values(data).returning();
        return result ?? null;
    }

    public async delete(id: string) {
        const result = await this.db
            .delete(schema.userIdentities)
            .where(eq(schema.userIdentities.id, id));

        return result.count.valueOf() > 0;
    }

    public async findAllByUserId(userId: string) {
        return this.db
            .select()
            .from(schema.userIdentities)
            .where(eq(schema.userIdentities.userId, userId));
    }

    public async findByProvider(provider: 'google' | 'yandex' | 'github', providerUserId: string) {
        const [result] = await this.db
            .select()
            .from(schema.userIdentities)
            .where(
                and(
                    eq(schema.userIdentities.provider, provider),
                    eq(schema.userIdentities.providerUserId, providerUserId),
                ),
            );

        return result ?? null;
    }
}
