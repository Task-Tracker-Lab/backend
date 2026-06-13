import { baseSchema } from '@shared/entities';

export const stateTypeEnum = baseSchema.enum('state_type', [
    'backlog',
    'todo',
    'in_progress',
    'review',
    'done',
    'archived',
    'custom',
]);

export const stateCategoryEnum = baseSchema.enum('state_category', [
    'backlog',
    'active',
    'review',
    'completed',
    'archived',
]);
