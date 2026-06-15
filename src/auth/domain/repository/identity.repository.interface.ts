import type { userIdentities } from '../../infrastructure/persistence/models/identity.model';

export type IdentitiyInsert = typeof userIdentities.$inferInsert;
export type IdentitiySelect = typeof userIdentities.$inferSelect;

export interface IIdentityRepository {
    create(data: IdentitiyInsert): Promise<IdentitiySelect>;
    findByProvider(
        provider: 'google' | 'yandex' | 'github',
        providerUserId: string,
    ): Promise<IdentitiySelect | null>;
    findAllByUserId(userId: string): Promise<readonly IdentitiySelect[]>;
    delete(id: string): Promise<boolean>;
}
