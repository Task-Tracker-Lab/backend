import { DEFAULT_VIEWS } from '@core/area/domain/entities';
import { ActionResponseSchema } from '@shared/schemas';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const DefaultViewSchema = z
    .enum(DEFAULT_VIEWS)
    .default('kanban')
    .describe('Тип отображения по умолчанию для области');

export const AreaSchema = z.object({
    id: z.string().min(1, 'ID не может быть пустым').describe('Уникальный идентификатор области'),
    projectId: z
        .string()
        .min(1, 'ID проекта обязателен')
        .describe('ID проекта, к которому принадлежит область'),
    title: z
        .string()
        .min(1, 'Название области обязательно')
        .max(255, 'Название не должно превышать 255 символов')
        .describe('Отображаемое название области (например: "Разработка", "Согласование")'),
    slug: z
        .string()
        .min(1, 'Slug обязателен')
        .max(100, 'Slug не должен превышать 100 символов')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug должен быть в формате kebab-case')
        .describe('URL-дружественный идентификатор (например: "development", "contract-approval")'),
    description: z
        .string()
        .nullable()
        .optional()
        .describe('Markdown-описание области, её цели и правила работы'),
    descriptionHtml: z
        .string()
        .nullable()
        .optional()
        .describe('Сгенерированный HTML из Markdown описания'),
    color: z
        .string()
        .regex(
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
            'Цвет должен быть в HEX формате (#RRGGBB или #RGB)',
        )
        .nullable()
        .optional()
        .describe('HEX-код цвета для визуального выделения области'),
    icon: z
        .string()
        .max(20, 'Иконка должна быть не длиннее 20 символов')
        .nullable()
        .optional()
        .describe('Emoji или иконка для визуального обозначения (например: "💻", "📝", "🎨")'),
    tasksCount: z
        .number()
        .int('Количество задач должно быть целым числом')
        .min(0, 'Количество задач не может быть отрицательным')
        .default(0)
        .describe('Общее количество задач в этой области (денормализованное поле)'),
    defaultView: DefaultViewSchema.describe('Представление по умолчанию для области'),
    position: z
        .number()
        .int('Позиция должна быть целым числом')
        .min(0, 'Позиция не может быть отрицательной')
        .default(0)
        .describe('Порядок отображения области в списке (меньше число — выше)'),
    maxTasksLimit: z
        .number()
        .int('Лимит задач должен быть целым числом')
        .max(100000, 'Лимит задач не может превышать 100 000')
        .positive('Лимит задач должен быть положительным числом')
        .nullable()
        .optional()
        .describe('Максимальное количество задач во всей области. Null — без лимита'),
    isLocked: z
        .boolean()
        .default(false)
        .describe('Заблокирована для изменений (нельзя добавлять/удалять задачи)'),
    createdAt: z
        .string()
        .datetime({ offset: true })
        .describe('Дата и время создания области (ISO 8601 с таймзоной)'),
    updatedAt: z
        .string()
        .datetime({ offset: true })
        .describe('Дата и время последнего обновления области'),
    createdBy: z.string().nullable().optional().describe('ID пользователя, создавшего область'),
    deletedAt: z
        .string()
        .datetime({ offset: true })
        .nullable()
        .optional()
        .describe('Дата мягкого удаления (null — не удалено)'),
});

export const CreateAreaSchema = AreaSchema.omit({
    id: true,
    projectId: true,
    tasksCount: true,
    createdAt: true,
    updatedAt: true,
    createdBy: true,
    deletedAt: true,
})
    .partial({
        description: true,
        descriptionHtml: true,
        color: true,
        icon: true,
        position: true,
        maxTasksLimit: true,
        defaultView: true,
    })
    .extend({
        slug: z
            .string()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug должен быть в формате kebab-case')
            .optional()
            .describe('Опциональный slug. Если не указан — генерируется из title'),
    })
    .describe('Схема для создания новой области');

export const CreateAreaResponseSchema = ActionResponseSchema.extend({
    slug: z.string(
        'URL-дружественный идентификатор (например: "development", "contract-approval")',
    ),
});

export const UpdateAreaSchema = CreateAreaSchema.partial()
    .refine((data) => Object.keys(data).length > 0, {
        error: 'Необходимо передать хотя бы одно поле для обновления',
        abort: true,
    })
    .describe('Схема для обновления области');

export const AreasSchema = z.array(AreaSchema);

export class CreateAreaResponse extends createZodDto(CreateAreaResponseSchema) {}
export class AreaResponse extends createZodDto(AreaSchema) {}
export class AreasResponse extends createZodDto(AreasSchema) {}
export class CreateAreaDto extends createZodDto(CreateAreaSchema) {}
export class UpdateAreaDto extends createZodDto(UpdateAreaSchema) {}
