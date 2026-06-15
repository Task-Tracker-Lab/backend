import { createId } from '@paralleldrive/cuid2';
import { baseSchema, users } from '@shared/entities';
import { isNotNull, isNull } from 'drizzle-orm';
import {
    text,
    boolean,
    varchar,
    timestamp,
    integer,
    uniqueIndex,
    index,
} from 'drizzle-orm/pg-core';

import { areas } from './area.model';
import { stateCategoryEnum, stateTypeEnum } from './enum';

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
        stateTitleIdx: index('idx_states_title').on(t.areaId, t.title),
        stateCreatedAtIdx: index('idx_states_created_at').on(t.areaId, t.createdAt),
        searchIdx: index('idx_states_search').on(t.areaId, t.title),
        uniqueStateTitle: uniqueIndex('idx_states_unique_title')
            .on(t.areaId, t.title)
            .where(isNull(t.deletedAt)),
        deletedAtIdx: index('idx_states_deleted_at').on(t.deletedAt).where(isNotNull(t.deletedAt)),
    }),
);
