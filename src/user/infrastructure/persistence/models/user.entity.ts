import { createId } from '@paralleldrive/cuid2';
import { baseSchema } from '@shared/entities';
import { varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = baseSchema.table('users', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    username: varchar('username', { length: 50 }).unique(),
    headline: varchar('headline', { length: 200 }),
    location: varchar('location', { length: 255 }),
    firstName: varchar('first_name', { length: 50 }).notNull(),
    lastName: varchar('last_name', { length: 50 }).notNull(),
    middleName: varchar('middle_name', { length: 50 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    bio: text('bio'),
    phone: varchar('phone', { length: 20 }),
    vacationStart: timestamp('vacation_start', { withTimezone: true, mode: 'string' }),
    vacationEnd: timestamp('vacation_end', { withTimezone: true, mode: 'string' }),
    vacationMessage: varchar('vacation_message', { length: 255 }),
    gender: text('gender')
        .$type<'male' | 'female' | 'non_binary' | 'other' | 'none' | 'prefer_not_to_say'>()
        .default('none'),
    pronouns: text('pronouns')
        .$type<'he_him' | 'she_her' | 'they_them' | 'other' | 'none'>()
        .default('none'),
    pronounsCustom: varchar('pronouns_custom', { length: 50 }),
    avatarUrl: varchar('avatar_url', { length: 512 }),
    emailVerified: boolean('email_verified').default(false).notNull(),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true, mode: 'string' }),
    lastTeamId: text('last_team_id'),
    deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
        .defaultNow()
        .notNull(),
});

export const userPreferences = baseSchema.table('user_preferences', {
    userId: text('user_id')
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    theme: text('theme').$type<'light' | 'dark' | 'system'>().default('system'),
    timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),
    language: varchar('language', { length: 5 }).default('ru').notNull(),
});

export const userSecurity = baseSchema.table('user_security', {
    userId: text('user_id')
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    passwordHash: varchar('password_hash', { length: 255 }),
    recoveryEmail: varchar('recovery_email', { length: 255 }),
    is2faEnabled: boolean('is_2fa_enabled').default(false).notNull(),
    twoFactorSecret: text('two_factor_secret'),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true, mode: 'string' }),
    lastPasswordChange: timestamp('last_password_change', { withTimezone: true, mode: 'string' })
        .defaultNow()
        .notNull(),
});

export const userNotifications = baseSchema.table('user_notifications', {
    userId: text('user_id')
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    settings: jsonb('settings')
        .$type<{
            readonly email: {
                readonly task_assigned: boolean;
                readonly mentions: boolean;
                readonly daily_summary: boolean;
            };
            readonly push: { readonly task_assigned: boolean; readonly reminders: boolean };
        }>()
        .default({
            email: { task_assigned: true, mentions: true, daily_summary: false },
            push: { task_assigned: true, reminders: true },
        })
        .notNull(),
});

export const userActivity = baseSchema.table('user_activity', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    eventType: varchar('event_type', { length: 50 }).notNull(),
    entityId: varchar('entity_id'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
        .defaultNow()
        .notNull(),
});
