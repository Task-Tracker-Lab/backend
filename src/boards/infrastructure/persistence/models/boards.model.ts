import {
    text,
    varchar,
    timestamp,
    jsonb,
    doublePrecision,
    uniqueIndex,
    boolean,
} from 'drizzle-orm/pg-core';
import { baseSchema, projects, users } from '@shared/entities';
import { columnStatusEnum, boardTypeEnum } from './enums';
import { createId } from '@paralleldrive/cuid2';

interface ISettings {
    [key: string]: unknown;
}

export const boards = baseSchema.table(
    'boards',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        name: varchar('name', { length: 100 }).notNull(),
        projectId: text('project_id')
            .references(() => projects.id, { onDelete: 'cascade' })
            .notNull(),
        settings: jsonb('settings').$type<ISettings>().default({}).notNull(),
        position: doublePrecision('position').notNull(),
        ownerId: text('owner_id').references(() => users.id, { onDelete: 'set null' }),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        projectBoardNameIdx: uniqueIndex('project_board_name_idx').on(table.projectId, table.name),
    }),
);

export const boardColumns = baseSchema.table('board_columns', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    boardId: text('board_id')
        .references(() => boards.id, { onDelete: 'cascade' })
        .notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    status: columnStatusEnum('status').default('backlog').notNull(),
    visibility: boolean('visibility').default(true).notNull(),
    position: doublePrecision('position').notNull(),

    color: varchar('color', { length: 7 }).default('#64748b').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
        .defaultNow()
        .notNull(),
});

export const boardViews = baseSchema.table('boards_views', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => createId()),
    boardId: text('board_id')
        .references(() => boards.id, { onDelete: 'cascade' })
        .notNull(),
    type: boardTypeEnum('type').default('kanban').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    settings: jsonb('settings').$type<ISettings>().default({}).notNull(),
    position: doublePrecision('position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
        .defaultNow()
        .notNull(),
});
