export const PROJECT_STATUSES = ['active', 'archived', 'template', 'deleted'] as const;
export const PROJECT_VISIBILITIES = ['public', 'private'] as const;
export const LAYOUTS = ['kanban', 'list', 'calendar', 'gantt'] as const;

export const MEMBER_ROLES = [
    'owner', // Владелец — создатель проекта, может всё, включая удаление
    'admin', // Админ — управляет участниками, настройками, может всё кроме удаления
    'editor', // Редактор — создает и редактирует задачи, меняет статусы, но не управляет людьми
    'member', // Участник — работает со своими задачами, комментирует
    'viewer', // Наблюдатель — только смотрит, комментирует
] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectVisibility = (typeof PROJECT_VISIBILITIES)[number];
export type Layout = (typeof LAYOUTS)[number];
