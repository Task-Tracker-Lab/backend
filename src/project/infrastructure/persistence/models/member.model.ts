import { createId } from '@paralleldrive/cuid2';
import { baseSchema, projects, users } from '@shared/entities';
import { index, uniqueIndex, timestamp, varchar, text } from 'drizzle-orm/pg-core';

export const projectMembers = baseSchema.table(
    'project_members',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => createId()),
        projectId: text('project_id')
            .references(() => projects.id, { onDelete: 'cascade' })
            .notNull(),
        userId: text('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        role: varchar('role', { length: 20 }).notNull().default('member'),
        addedBy: text('added_by').references(() => users.id),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (t) => ({
        uniqueMember: uniqueIndex('project_member_unique_idx').on(t.projectId, t.userId),
        userIdx: index('project_member_user_idx').on(t.userId),
        projectIdx: index('project_member_project_idx').on(t.projectId),
    }),
);
