import { userIdentities } from '../../infrastructure/persistence/models/identities.model';

export type IdentitiesInsert = typeof userIdentities.$inferInsert;
export type IdentitiesSelect = typeof userIdentities.$inferSelect;

export interface IIdentitiesRepository {
    create(data: IdentitiesInsert): Promise<IdentitiesSelect>;
    findByProvider(
        provider: 'google' | 'yandex' | 'github',
        providerUserId: string,
    ): Promise<IdentitiesSelect | null>;
    findAllByUserId(userId: string): Promise<IdentitiesSelect[]>;
    delete(id: string): Promise<boolean>;
}
