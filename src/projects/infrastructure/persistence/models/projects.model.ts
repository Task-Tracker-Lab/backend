import {
    text,
    boolean,
    varchar,
    timestamp,
    jsonb,
    integer,
    uniqueIndex,
    index,
} from 'drizzle-orm/pg-core';
import { baseSchema, teams, users } from '@shared/entities';
import { createId } from '@paralleldrive/cuid2';
import { isNull, sql } from 'drizzle-orm';
import {
    projectStatusEnum,
    projectVisibilityEnum,
    stateCategoryEnum,
    stateTypeEnum,
} from './enums';

export const projects = baseSchema.table(
    'projects',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        teamId: text('team_id')
            .references(() => teams.id, { onDelete: 'cascade' })
            .notNull(),
        slug: varchar('slug', { length: 100 }).notNull(),
        name: varchar('name', { length: 100 }).notNull(),
        description: text('description'),
        icon: varchar('icon', { length: 255 }),
        color: varchar('color', { length: 7 }),
        status: projectStatusEnum('status').default('active').notNull(),
        taskSequence: integer('task_sequence').default(0).notNull(),
        ownerId: text('owner_id').references(() => users.id, { onDelete: 'set null' }),
        visibility: projectVisibilityEnum('visibility').default('public').notNull(),
        settings: jsonb('settings').default({}),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
    },
    (t) => ({
        uniqueTeamSlug: uniqueIndex('project_team_slug_idx')
            .on(t.teamId, t.slug)
            .where(isNull(t.deletedAt)),
        uniqueTeamName: uniqueIndex('project_team_name_idx')
            .on(t.teamId, t.name)
            .where(isNull(t.deletedAt)),
        ownerIdx: index('project_owner_id_idx').on(t.ownerId),
        teamIdx: index('project_team_id_idx').on(t.teamId),
    }),
);

export const projectStates = baseSchema.table(
    'project_states',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),

        title: text('title').notNull(),
        description: text('description'),

        slug: varchar('slug', { length: 50 }),

        stateType: stateTypeEnum('state_type').notNull().default('custom'),
        category: stateCategoryEnum('category').notNull().default('active'),

        color: varchar('color', { length: 10 }),
        icon: varchar('icon', { length: 20 }),

        orderIndex: integer('order_index').notNull().default(0),
        isVisible: boolean('is_visible').notNull().default(true),
        maxTasksLimit: integer('max_tasks_limit'),
        autoTransitionTo: text('auto_transition_to'),

        notifyOnEnter: boolean('notify_on_enter').default(false),
        notifyOnExit: boolean('notify_on_exit').default(false),
        isLocked: boolean('is_locked').default(false),
        version: integer('version').default(0),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
        createdBy: text('created_by').references(() => users.id),
        deletedAt: timestamp('deleted_at'),
    },
    (t) => ({
        projectOrderIdx: index('idx_project_states_project_order').on(t.projectId, t.orderIndex),

        uniqueProjectStateType: uniqueIndex('idx_project_states_unique_type')
            .on(t.projectId, t.stateType)
            .where(sql`deleted_at IS NULL AND state_type != 'custom'`),

        uniqueProjectStateTitle: uniqueIndex('idx_project_states_unique_title')
            .on(t.projectId, t.title)
            .where(sql`deleted_at IS NULL`),

        deletedAtIdx: index('idx_project_states_deleted_at')
            .on(t.deletedAt)
            .where(sql`deleted_at IS NOT NULL`),
    }),
);

export const projectShares = baseSchema.table(
    'project_shares',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        projectId: text('project_id')
            .notNull()
            .references(() => projects.id, { onDelete: 'cascade' }),
        token: text('token').notNull().unique(),
        expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
        createdBy: text('created_by').notNull(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        tokenIdx: index('token_idx').on(t.token),
        projectIdx: index('project_share_project_id_idx').on(t.projectId),
    }),
);
