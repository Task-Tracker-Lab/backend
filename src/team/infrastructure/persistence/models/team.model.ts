import { createId } from '@paralleldrive/cuid2';
import { baseSchema, users } from '@shared/entities';
import { primaryKey, timestamp, text, varchar, index } from 'drizzle-orm/pg-core';

import { roleEnum, statusEnum } from './enums';

export const team = baseSchema.table(
    'teams',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        name: varchar('name', { length: 100 }).notNull(),
        description: text('description'),
        avatarUrl: text('avatar_url'),
        coverUrl: text('cover_url'),
        ownerId: text('owner_id').references(() => users.id, { onDelete: 'set null' }),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
    },
    (t) => ({
        ownerIdx: index('team_owner_idx').on(t.ownerId),
        softDeleteIdx: index('team_deleted_at_idx').on(t.deletedAt),
    }),
);

export const teamMembers = baseSchema.table(
    'team_members',
    {
        teamId: text('team_id')
            .references(() => team.id, { onDelete: 'cascade' })
            .notNull(),
        userId: text('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        role: roleEnum('role').default('member').notNull(),
        status: statusEnum('status').default('inactive').notNull(),
        joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'string' }),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.teamId, t.userId] }),
        statusIdx: index('member_status_idx').on(t.status),
        userRoleIdx: index('member_role_idx').on(t.userId, t.role),
    }),
);
