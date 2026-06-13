import {
    text,
    boolean,
    varchar,
    timestamp,
    integer,
    uniqueIndex,
    index,
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { isNotNull, isNull } from 'drizzle-orm';
import { stateCategoryEnum, stateTypeEnum } from './enum';
import { baseSchema, projects, users } from '@shared/entities';

export const areas = baseSchema.table(
    'areas',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
        title: text('title').notNull(),
        slug: varchar('slug', { length: 100 }).notNull().unique(),
        description: text('description'),
        descriptionHtml: text('description_html'),
        color: varchar('color', { length: 10 }),
        tasksCount: integer('tasks_count').notNull().default(0),
        defaultView: varchar('default_view', { length: 20 }).notNull().default('kanban'),
        icon: varchar('icon', { length: 20 }),
        position: integer('position').notNull().default(0),
        maxTasksLimit: integer('max_tasks_limit'),
        isLocked: boolean('is_locked').default(false),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
            .notNull()
            .defaultNow(),
        createdBy: text('created_by').references(() => users.id),
        deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
    },
    (t) => ({
        slugIdx: index('idx_areas_slug').on(t.slug),
        projectActiveIdx: index('idx_areas_project_active')
            .on(t.projectId, t.position)
            .where(isNull(t.deletedAt)),
        createdByIdx: index('idx_areas_created_by').on(t.createdBy).where(isNull(t.deletedAt)),
        deletedAtIdx: index('idx_areas_deleted_at').on(t.deletedAt).where(isNotNull(t.deletedAt)),
    }),
);

export const states = baseSchema.table(
    'states',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        areaId: text('area_id').references(() => areas.id, { onDelete: 'cascade' }),
        title: text('title').notNull(),
        description: text('description'),
        stateType: stateTypeEnum('state_type').notNull().default('custom'),
        category: stateCategoryEnum('category').notNull().default('active'),
        color: varchar('color', { length: 10 }),
        icon: varchar('icon', { length: 20 }),
        position: integer('position').notNull().default(0),
        isVisible: boolean('is_visible').notNull().default(true),
        maxTasksLimit: integer('max_tasks_limit'),
        autoTransitionTo: text('auto_transition_to'),
        notifyOnEnter: boolean('notify_on_enter').default(false),
        notifyOnExit: boolean('notify_on_exit').default(false),
        isLocked: boolean('is_locked').default(false),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
            .notNull()
            .defaultNow(),
        createdBy: text('created_by').references(() => users.id),
        deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
    },
    (t) => ({
        statePositionIdx: index('idx_states_position').on(t.areaId, t.position),
        uniqueStateTitle: uniqueIndex('idx_states_unique_title')
            .on(t.areaId, t.title)
            .where(isNull(t.deletedAt)),
        deletedAtIdx: index('idx_states_deleted_at').on(t.deletedAt).where(isNotNull(t.deletedAt)),
    }),
);
