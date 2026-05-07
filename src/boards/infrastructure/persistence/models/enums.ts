import { baseSchema } from '@shared/entities';

export const boardTypeEnum = baseSchema.enum('board_type', ['kanban', 'calendar', 'gantt_matrix']);

export const columnStatusEnum = baseSchema.enum('column_status', [
    'backlog',
    'todo',
    'in_progress',
    'done',
    'canceled',
]);
