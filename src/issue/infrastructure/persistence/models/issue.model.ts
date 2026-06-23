import { createId } from '@paralleldrive/cuid2';
import { areas, baseSchema, states, users } from '@shared/entities';
import { sql } from 'drizzle-orm';
import { timestamp, integer, varchar, text, index, check } from 'drizzle-orm/pg-core';

import { issueTypeEnum, priorityEnum } from './enum';

export const issues = baseSchema.table(
    'issues',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        title: varchar('title', { length: 255 }).notNull(),
        description: text('description'),
        descriptionHtml: text('description_html'),
        priority: priorityEnum('priority').default('medium').notNull(),
        type: issueTypeEnum('type').default('task').notNull(),
        areaId: text('area_id')
            .notNull()
            .references(() => areas.id, { onDelete: 'cascade' }),
        stateId: text('state_id').references(() => states.id, {
            onDelete: 'set null',
        }),
        position: integer('position').default(0),
        assigneeId: text('assignee_id').references(() => users.id, {
            onDelete: 'set null',
        }),
        reporterId: text('reporter_id').references(() => users.id, {
            onDelete: 'set null',
        }),
        parentId: text('parent_id').references((): any => issues.id, {
            onDelete: 'set null',
        }),
        storyPoints: integer('story_points'),
        dueDate: timestamp('due_date', { withTimezone: true, mode: 'string' }),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
        deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
    },
    (table) => ({
        areaStateIdx: index('idx_issue_area_state')
            .on(table.areaId, table.stateId, table.position)
            .where(sql`${table.deletedAt} IS NULL`),
        assigneeIdx: index('idx_issue_assignee')
            .on(table.assigneeId)
            .where(sql`${table.deletedAt} IS NULL`),
        parentIdx: index('idx_issue_parent')
            .on(table.parentId)
            .where(sql`${table.deletedAt} IS NULL`),
        priorityIdx: index('idx_issue_priority')
            .on(table.priority)
            .where(sql`${table.deletedAt} IS NULL`),
        typeIdx: index('idx_issue_type')
            .on(table.type)
            .where(sql`${table.deletedAt} IS NULL`),

        searchIdx: index('idx_issue_search')
            .using(
                'gin',
                sql`to_tsvector('english', COALESCE(${table.title}, '') || ' ' || COALESCE(${table.description}, ''))`,
            )
            .where(sql`${table.deletedAt} IS NULL`),

        noSelfParent: check(
            'no_self_parent',
            sql`${table.parentId} IS NULL OR ${table.parentId} != ${table.id}`,
        ),
    }),
);
