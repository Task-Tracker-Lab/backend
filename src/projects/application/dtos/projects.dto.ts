import { z } from 'zod/v4';
import { createZodDto } from 'nestjs-zod';
import { ActionResponseSchema } from '@shared/dtos';
import { createPaginationSchema } from '@shared/schemas';
import { ProjectStatus, ProjectVisibility } from '@core/projects/domain/entities';

export const ProjectVisibilitySchema = z.enum(['public', 'private']).default('private');

export const CreateProjectSchema = z.object({
    name: z
        .string()
        .min(1, 'Название проекта не может быть пустым')
        .max(100, 'Название не должно превышать 100 символов')
        .describe('Название проекта'),
    slug: z
        .string()
        .min(2, 'Ключ проекта должен быть от 2 до 10 символов')
        .max(10)
        .regex(/^[a-z0-9]+$/, 'Ключ должен содержать только строчные латинские буквы и цифры')
        .describe('Уникальный ключ проекта в URL (2-10 символов, a-z0-9)'),
    description: z
        .string()
        .max(2000, 'Описание слишком длинное')
        .nullable()
        .optional()
        .default(null)
        .describe('Описание проекта'),
    icon: z
        .string()
        .max(255, 'URL иконки слишком длинный')
        .nullable()
        .optional()
        .default(null)
        .describe('Иконка проекта (эмодзи, URL или id шрифта)'),
    color: z
        .string()
        .regex(/^#[A-Fa-f0-9]{6}$/, 'Цвет должен быть в формате HEX')
        .nullable()
        .optional()
        .default('#3B82F6')
        .describe('Цвет проекта в HEX (#RRGGBB)'),
    visibility: ProjectVisibilitySchema.optional()
        .default('public')
        .describe('Видимость: public | private'),
    taskSequence: z
        .number()
        .int()
        .min(0)
        .optional()
        .default(0)
        .describe('Счётчик для автонумерации задач'),
});

export class CreateProjectDto extends createZodDto(CreateProjectSchema) {}

export const UpdateProjectSchema = CreateProjectSchema.extend({
    status: z.enum([ProjectStatus.Active, ProjectStatus.Archived]).optional(),
    isPublic: z.boolean().optional(),
})
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        error: 'Необходимо передать хотя бы одно поле для обновления',
        abort: true,
    });

export class UpdateProjectDto extends createZodDto(UpdateProjectSchema) {}

const CreateProjectsResponseSchema = ActionResponseSchema.extend({
    slug: z.string().describe('Уникальный идентификатор проекта в системе'),
});

export class CreateProjectResponse extends createZodDto(CreateProjectsResponseSchema) {}

export const CreateShareTokenSchema = z.object({
    ttl: z
        .string()
        .datetime()
        .optional()
        .nullable()
        .describe('Дата истечения ссылки. Если не указана — ставится дефолт 3 месяца'),
});

export class CreateShareTokenDto extends createZodDto(CreateShareTokenSchema) {}

export const CreateShareTokenResponseSchema = ActionResponseSchema.extend({
    payload: z.object({
        token: z.string().describe('Токен'),
        isYourself: z
            .boolean()
            .describe('Флаг указывает, что ссылка была сгенерирована текущим пользователем'),
        expiresAt: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
                message: 'Строка не является валидной датой',
            })
            .describe("'Дата истечения ссылки. Если не была указана — ставится дефолт 3 месяца'"),
    }),
});

export class CreateShareTokenResponse extends createZodDto(CreateShareTokenResponseSchema) {}

const TeamShortSchema = z.object({
    id: z.string().describe('ID команды'),
    name: z.string().describe('Название команды'),
    role: z.string().describe('Роль пользователя в команде'),
});

export const ProjectListItemSchema = z.object({
    id: z.string().describe('ID проекта'),
    key: z.string().describe('Ключ проекта'),
    name: z.string().describe('Название проекта'),
    status: z.nativeEnum(ProjectStatus).describe('Статус проекта'),
    color: z.string().describe('Цвет проекта'),
    icon: z.string().nullable().optional().describe('Иконка проекта'),
    createdAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата создания проекта'),
    canEdit: z.boolean().describe('Флаг возможности редактировать проект'),
});

export const ProjectListResponseSchema = createPaginationSchema(ProjectListItemSchema).extend({
    team: TeamShortSchema,
});

export class ProjectListResponse extends createZodDto(ProjectListResponseSchema) {}

export const ProjectDetailResponseSchema = z.object({
    id: z.string().describe('ID проекта'),
    key: z.string().describe('Ключ проекта'),
    name: z.string().describe('Название проекта'),
    status: z.nativeEnum(ProjectStatus).describe('Статус проекта'),
    description: z.string().nullable().describe('Описание проекта'),
    visuals: z.object({
        color: z.string().describe('Цвет проекта'),
        icon: z.string().nullable().optional().describe('Иконка проекта'),
    }),
    meta: z.object({
        taskSequence: z.number().int().nonnegative().describe('Счётчик задач'),
        createdAt: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
                message: 'Строка не является валидной датой',
            })
            .describe('Дата создания'),
        updatedAt: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
                message: 'Строка не является валидной датой',
            })
            .describe('Дата обновления'),
    }),
    access: z.object({
        visibility: z.nativeEnum(ProjectVisibility).describe('Видимость проекта'),
        canEdit: z.boolean().describe('Можно ли редактировать проект'),
        canDelete: z.boolean().describe('Можно ли удалить проект'),
        shareUrl: z.string().nullable().describe('Ссылка на шаринг проекта'),
    }),
    settings: z.record(z.string(), z.unknown()).describe('Настройки проекта'),
});

export class ProjectDetailResponse extends createZodDto(ProjectDetailResponseSchema) {}
