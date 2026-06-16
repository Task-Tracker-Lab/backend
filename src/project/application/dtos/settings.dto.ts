import { z } from 'zod/v4';

export const ProjectSettingsSchema = z
    .object({
        id: z
            .string()
            .min(1, 'ID не может быть пустым')
            .describe('Уникальный идентификатор настроек'),
        projectId: z
            .string()
            .min(1, 'ID проекта обязателен')
            .describe('ID проекта, к которому относятся настройки'),
        defaultView: z
            .enum(['kanban', 'list', 'calendar', 'gantt'])
            .default('kanban')
            .describe('Представление по умолчанию'),
        taskPrefix: z
            .string()
            .max(10, 'Префикс не должен превышать 10 символов')
            .nullable()
            .optional()
            .describe('Префикс для номеров задач'),
        autoCloseDays: z
            .number()
            .int('Должно быть целым числом')
            .positive('Должно быть положительным числом')
            .nullable()
            .optional()
            .describe('Автозакрытие неактивных задач через N дней'),
        maxTasksPerArea: z
            .number()
            .int('Должно быть целым числом')
            .positive('Должно быть положительным числом')
            .nullable()
            .optional()
            .describe('Максимум задач в одной области'),
        maxMembers: z
            .number()
            .int('Должно быть целым числом')
            .positive('Должно быть положительным числом')
            .nullable()
            .optional()
            .describe('Максимум участников проекта'),
        maxAreas: z
            .number()
            .int('Должно быть целым числом')
            .positive('Должно быть положительным числом')
            .nullable()
            .optional()
            .describe('Максимум областей в проекте'),
        allowGuests: z.boolean().default(false).describe('Разрешить гостевой доступ по ссылке'),
        timeTracking: z.boolean().default(false).describe('Включить учет времени по задачам'),
        timeTrackingMode: z
            .enum(['optional', 'required', 'disabled'])
            .default('optional')
            .describe('Режим учета времени'),
        defaultAssigneeId: z
            .string()
            .nullable()
            .optional()
            .describe('ID исполнителя по умолчанию для новых задач'),
        createdAt: z.string().datetime({ offset: true }).describe('Дата создания настроек'),
        updatedAt: z
            .string()
            .datetime({ offset: true })
            .describe('Дата последнего обновления настроек'),
    })
    .describe('Полная схема настроек проекта');

export const CreateProjectSettingsSchema = ProjectSettingsSchema.omit({
    id: true,
    projectId: true,
    createdAt: true,
    updatedAt: true,
})
    .partial({
        defaultView: true,
        timeTrackingMode: true,
    })
    .describe('Схема настроек при создании проекта');

export const UpdateProjectSettingsSchema = ProjectSettingsSchema.omit({
    id: true,
    projectId: true,
    createdAt: true,
    updatedAt: true,
})
    .partial()
    .describe('Схема для обновления настроек проекта');
