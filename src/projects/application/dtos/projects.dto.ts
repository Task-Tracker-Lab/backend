import { z } from 'zod/v4';
import { createZodDto } from 'nestjs-zod';
import { ActionResponseSchema } from '@shared/dtos';
import { createPaginationSchema } from '@shared/schemas';
import { ProjectStatus, ProjectVisibility } from '@core/projects/domain/entities';

export const CreateProjectSchema = z.object({
    name: z
        .string()
        .min(1, 'Название проекта не может быть пустым')
        .max(100, 'Название не должно превышать 100 символов'),
    slug: z
        .string()
        .min(2, 'Ключ проекта должен быть от 2 до 10 символов')
        .max(10)
        .regex(/^[A-Z0-9]+$/, 'Ключ должен содержать только заглавные латинские буквы и цифры'),
    description: z.string().max(2000, 'Описание слишком длинное').optional().nullable(),
    icon: z.string().optional().nullable(),
    color: z
        .string()
        .regex(/^#[A-Fa-f0-9]{6}$/, 'Цвет должен быть в формате HEX (например, #FFFFFF)')
        .optional(),
    visibility: z.enum(['public', 'private']).default('public'),
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
    projectId: z.string().describe('Уникальный идентификатор проекта в системе'),
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
