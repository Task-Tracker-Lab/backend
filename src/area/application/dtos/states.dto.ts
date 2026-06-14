import { z } from 'zod/v4';
import { createZodDto } from 'nestjs-zod';
import { ActionResponseSchema } from '@shared/dtos';
import { STATE_CATEGORIES, STATE_TYPES } from '@core/area/domain/entities';

export const StateTypeSchema = z
    .enum(STATE_TYPES)
    .describe('Тип состояния: системный или кастомный');

export const StateCategorySchema = z
    .enum(STATE_CATEGORIES)
    .describe('Категория состояния: активное, завершённое или отменённое');

export const StateSchema = z.object({
    id: z
        .string()
        .min(1, 'ID не может быть пустым')
        .describe('Уникальный идентификатор состояния (UUID или наноид)'),
    title: z
        .string()
        .min(1, 'Название состояния обязательно')
        .max(255, 'Название не должно превышать 255 символов')
        .describe('Отображаемое название состояния (например: "To Do", "In Progress", "Done")'),
    description: z
        .string()
        .nullable()
        .optional()
        .describe('Описание состояния, его назначение и правила использования в workflow'),
    stateType: StateTypeSchema.default('custom').describe(
        'Тип состояния: custom — пользовательское, default — системное (нельзя удалить)',
    ),
    category: StateCategorySchema.default('active').describe(
        'Группа для аналитики и фильтрации: backlog, active, done, closed',
    ),
    color: z
        .string()
        .regex(
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            'Цвет должен быть в HEX формате (#RRGGBB или #RGB)',
        )
        .nullable()
        .optional()
        .describe('HEX-код цвета для визуального отображения на доске (например: "#4A90E2")'),
    icon: z
        .string()
        .max(20, 'Иконка должна быть не длиннее 20 символов')
        .nullable()
        .optional()
        .describe('Emoji или иконка для визуального обозначения (например: "📋", "🚀", "✅")'),
    orderIndex: z
        .number()
        .int('Порядковый номер должен быть целым числом')
        .min(0, 'Порядковый номер не может быть отрицательным')
        .default(0)
        .describe('Порядок отображения на доске (меньше число — левее/выше)'),
    isVisible: z
        .boolean()
        .default(true)
        .describe('Видимость состояния на доске и в выпадающих списках (можно скрыть, не удаляя)'),
    maxTasksLimit: z
        .number()
        .int('Лимит задач должен быть целым числом')
        .positive('Лимит задач должен быть положительным числом')
        .nullable()
        .optional()
        .describe(
            'Максимальное количество задач в этом состоянии (WIP лимит для Kanban). Null — без лимита',
        ),
    autoTransitionTo: z
        .string()
        .nullable()
        .optional()
        .describe('Автоматический переход в другое состояние при достижении лимита или по условию'),
    notifyOnEnter: z
        .boolean()
        .default(false)
        .describe('Отправлять уведомление, когда задача попадает в это состояние'),
    notifyOnExit: z
        .boolean()
        .default(false)
        .describe('Отправлять уведомление, когда задача покидает это состояние'),
    isLocked: z
        .boolean()
        .default(false)
        .describe('Заблокировано для изменений (нельзя перемещать задачи в/из этого состояния)'),
    createdAt: z
        .string()
        .datetime({ offset: true })
        .describe('Дата и время создания состояния (ISO 8601 с таймзоной)'),
    updatedAt: z
        .string()
        .datetime({ offset: true })
        .describe('Дата и время последнего обновления состояния'),
    createdBy: z.string().nullable().optional().describe('ID пользователя, создавшего состояние'),
    deletedAt: z
        .string()
        .datetime({ offset: true })
        .nullable()
        .optional()
        .describe('Дата мягкого удаления (null — не удалено)'),
});

export const CreateStateResponseSchema = ActionResponseSchema.extend({
    stateId: z.string().describe('ID созданного состояния'),
});

export const StatesSchema = z.array(StateSchema);

export const CreateStateSchema = StateSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    deletedAt: true,
})
    .partial({
        description: true,
        color: true,
        icon: true,
        maxTasksLimit: true,
        autoTransitionTo: true,
    })
    .describe('Схема для создания нового состояния');

export const ReorderStateItemSchema = z.object({
    id: z.string().describe('ID состояния'),
    orderIndex: z.number().min(0).describe('Новый порядковый индекс'),
});

export const ReorderStatesSchema = z.object({
    items: z.array(ReorderStateItemSchema).min(1).describe('Массив состояний с новыми индексами'),
});

export class StateResponse extends createZodDto(StateSchema) {}
export class StatesResponse extends createZodDto(StatesSchema) {}
export class CreateStateDto extends createZodDto(CreateStateSchema) {}
export class UpdateStateDto extends createZodDto(CreateStateSchema.partial()) {}
export class CreateStateResponse extends createZodDto(CreateStateResponseSchema) {}
export class ReordersStatesDto extends createZodDto(ReorderStatesSchema) {}
