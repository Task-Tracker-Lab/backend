import { z } from 'zod/v4';
import { createZodDto } from 'nestjs-zod';
import { AvatarResponseSchema, createPaginationSchema } from '@shared/schemas';

export const CreateTeamSchema = z.object({
    name: z.string().min(2).max(100).describe('Название команды, отображаемое в интерфейсе'),
    description: z
        .string()
        .min(10)
        .max(500)
        .describe('Краткое описание деятельности или целей команды'),
    slug: z.string().optional().describe('Уникальная ссылка на изображение команду'),
});

export class CreateTeamDto extends createZodDto(CreateTeamSchema) {}
export class UpdateTeamDto extends createZodDto(
    CreateTeamSchema.partial().refine((data) => Object.keys(data).length > 0, {
        error: 'Необходимо передать хотя бы одно поле для обновления',
        abort: true,
    }),
) {}

export const CheckSlugResponseSchema = z.object({
    available: z
        .boolean()
        .describe('Флаг доступности: true — адрес свободен, false — уже занят или некорректен'),
});

export class CheckSlugResponse extends createZodDto(CheckSlugResponseSchema) {}

export const TeamPermissionsSchema = z.object({
    canEdit: z.boolean().describe('Разрешено ли редактировать настройки и профиль команды'),
    canDelete: z
        .boolean()
        .describe('Разрешено ли полностью удалить команду (только для владельца)'),
    canManageMembers: z.boolean().describe('Разрешено ли менять роли и исключать участников'),
    canInvite: z.boolean().describe('Разрешено ли приглашать новых участников'),
    isOwner: z.boolean().describe('Является ли текущий пользователь владельцем (Owner)'),
});

export const UserTeamSchema = z.object({
    id: z.string().describe('Уникальный ID команды'),
    name: z.string().describe('Название команды'),
    slug: z.string().describe('Уникальный URL-путь команды'),
    description: z.string().nullable().describe('Краткое описание команды'),
    avatar: AvatarResponseSchema,
    role: z.string().describe('Системное название роли пользователя'),
    joinedAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата, когда пользователь вступил в команду'),
    permissions: TeamPermissionsSchema.describe('Объект прав доступа текущего пользователя'),
});

export class UserTeamResponse extends createZodDto(UserTeamSchema) {}

export class UserTeamsResponse extends createZodDto(createPaginationSchema(UserTeamSchema)) {}

export const TeamResponseSchema = z.object({
    id: z.string().describe('Уникальный ID команды'),
    slug: z.string().describe('Слаг команды'),
    name: z.string().describe('Название команды'),
    description: z.string().nullable().describe('Описание команды'),
    avatarUrl: z
        .string()
        .url()
        .nullable()
        .describe('URL аватара команды или null, если аватар отсутствует'),
    //TODO: replace with schema
    // avatar: AvatarResponseSchema,
    coverUrl: z.string().nullable().describe('URL обложки команды'),
    ownerId: z.string().nullable().describe('ID владельца команды'),
    createdAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата создания команды'),
    updatedAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата обновления команды'),
    deletedAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .nullable()
        .describe('Дата удаления (если удалена)'),
});

export class TeamResponse extends createZodDto(TeamResponseSchema) {}
