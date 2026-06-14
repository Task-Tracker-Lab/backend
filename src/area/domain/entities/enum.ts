export const STATE_TYPES = {
    BACKLOG: 'backlog',
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    REVIEW: 'review',
    DONE: 'done',
    ARCHIVED: 'archived',
    CUSTOM: 'custom',
} as const;

export type StateType = (typeof STATE_TYPES)[keyof typeof STATE_TYPES];

export const STATE_TYPES_LIST = Object.values(STATE_TYPES);

export const STATE_CATEGORIES = {
    BACKLOG: 'backlog',
    ACTIVE: 'active',
    REVIEW: 'review',
    COMPLETED: 'completed',
    ARCHIVED: 'archived',
} as const;

export type StateCategory = (typeof STATE_CATEGORIES)[keyof typeof STATE_CATEGORIES];

export const STATE_CATEGORIES_LIST = Object.values(STATE_CATEGORIES);

export const DEFAULT_VIEWS = {
    KANBAN: 'kanban',
    LIST: 'list',
    CALENDAR: 'calendar',
    GANTT: 'gantt',
} as const;

export type DefaultView = (typeof DEFAULT_VIEWS)[keyof typeof DEFAULT_VIEWS];

export const DEFAULT_VIEWS_LIST = Object.values(DEFAULT_VIEWS);
