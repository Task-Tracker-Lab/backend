import {
    text,
    varchar,
    timestamp,
    integer,
    boolean,
    uniqueIndex,
    index,
} from 'drizzle-orm/pg-core';
import { baseSchema, teams, users } from '@shared/entities';
import { createId } from '@paralleldrive/cuid2';
import { isNull } from 'drizzle-orm';
import { layoutEnum, projectStatusEnum, projectVisibilityEnum } from './enum';

export const projects = baseSchema.table(
    'projects',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        teamId: text('team_id')
            .references(() => teams.id, { onDelete: 'cascade' })
            .notNull(),
        slug: varchar('slug', { length: 100 }).notNull().unique(),
        name: varchar('name', { length: 100 }).notNull(),
        description: text('description'),
        descriptionHtml: text('descriptionHtml'),
        icon: varchar('icon', { length: 255 }),
        color: varchar('color', { length: 7 }),
        status: projectStatusEnum('status').default('active').notNull(),
        sequence: integer('sequence').default(0),
        ownerId: text('owner_id').references(() => users.id, { onDelete: 'set null' }),
        visibility: projectVisibilityEnum('visibility').default('public').notNull(),
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
        ownerIdx: index('project_owner_id_idx').on(t.ownerId),
        teamIdx: index('project_team_id_idx').on(t.teamId),
    }),
);

export const projectSettings = baseSchema.table(
    'project_settings',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        projectId: text('project_id')
            .references(() => projects.id, { onDelete: 'cascade' })
            .notNull()
            .unique(),
        defaultView: layoutEnum('default_view').default('kanban').notNull(),
        taskPrefix: varchar('task_prefix', { length: 10 }),
        autoCloseDays: integer('auto_close_days'),
        maxTasksPerArea: integer('max_tasks_per_area'),
        maxMembers: integer('max_members'),
        maxAreas: integer('max_areas'),
        allowGuests: boolean('allow_guests').default(false),
        timeTracking: boolean('time_tracking').default(false),
        timeTrackingMode: varchar('time_tracking_mode', { length: 20 }).default('optional'),
        defaultAssigneeId: text('default_assignee_id').references(() => users.id, {
            onDelete: 'set null',
        }),
        createdAt: timestamp('created_at', {
            withTimezone: true,
            mode: 'string',
        })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', {
            withTimezone: true,
            mode: 'string',
        })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        projectIdx: uniqueIndex('project_settings_project_idx').on(t.projectId),
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
        createdBy: text('created_by').references(() => users.id),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        tokenIdx: index('token_idx').on(t.token),
        projectIdx: index('project_share_project_id_idx').on(t.projectId),
    }),
);
