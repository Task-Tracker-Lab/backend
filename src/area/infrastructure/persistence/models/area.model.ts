import { text, boolean, varchar, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { isNotNull, isNull } from 'drizzle-orm';
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
