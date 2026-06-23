import { AvatarResponseSchema, createCursorResponseSchema } from '@shared/schemas';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

const NotificationsSchema = z
    .object({
        email: z.object({
            task_assigned: z.boolean().describe('Уведомление на почту при назначении задачи'),
            mentions: z.boolean().describe('Уведомление на почту при упоминании в комментариях'),
            daily_summary: z.boolean().describe('Ежедневная сводка задач на почту'),
        }),
        push: z.object({
            task_assigned: z.boolean().describe('Push-уведомление при назначении задачи'),
            reminders: z.boolean().describe('Push-уведомления о дедлайнах'),
        }),
    })
    .describe('Настройки уведомлений пользователя');

export const UpdateNotificationsSchema = NotificationsSchema.partial()
    .refine((data) => Object.keys(data).length > 0, {
        error: 'Необходимо передать хотя бы одно поле для обновления',
        abort: true,
    })
    .describe('Схема для частичного обновления настроек уведомлений');

export class UpdateNotificationsDto extends createZodDto(UpdateNotificationsSchema) {}

const SecuritySchema = z
    .object({
        is2faEnabled: z.boolean().describe('Статус двухфакторной аутентификации'),
        lastPasswordChange: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
                message: 'Строка не является валидной датой',
            })
            .describe('Дата последнего изменения пароля'),
    })
    .describe('Данные безопасности аккаунта');

const ProfileSchema = z.object({
    firstName: z.string().describe('Имя пользователя'),
    lastName: z.string().describe('Фамилия'),
    middleName: z.string().nullable().describe('Отчество'),
    bio: z.string().nullable().describe('О себе'),
    avatar: AvatarResponseSchema,
    headline: z
        .string()
        .nullable()
        .describe('Краткий заголовок или должность (например: "Senior Developer @ Company")'),
    location: z.string().nullable().describe('Город или страна проживания'),
    phone: z.string().nullable().describe('Номер телефона (для связи)'),
    gender: z
        .enum(['none', 'male', 'female', 'non_binary', 'other', 'prefer_not_to_say'])
        .default('none')
        .describe(
            'Пол пользователя: none - не указан, male - мужской, female - женский, non_binary - небинарный, other - другой, prefer_not_to_say - предпочитаю не указывать',
        ),
    vacationStart: z.string().nullable().describe('Дата начала отпуска (ISO 8601)'),
    vacationEnd: z.string().nullable().describe('Дата окончания отпуска (ISO 8601)'),
    vacationMessage: z.string().nullable().describe('Сообщение автоответчика на время отпуска'),
    pronouns: z
        .enum(['he_him', 'she_her', 'they_them', 'other', 'none'])
        .default('none')
        .describe(
            'Предпочитаемые местоимения: he_him - он/его, she_her - она/ее, they_them - они/их, other - другие, none - не указаны',
        ),
    pronounsCustom: z
        .string()
        .max(50, 'Максимальная длина 50 символов')
        .nullable()
        .optional()
        .describe('Пользовательские местоимения (заполняется, если pronouns = "other")'),
    createdAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата регистрации'),
    updatedAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата последнего обновления профиля'),
});

const PreferencesSchema = z.object({
    timezone: z
        .string()
        .describe('Временная зона пользователя (например: "Europe/Moscow", "UTC+3")'),
    language: z.string().describe('Язык интерфейса (ISO 639-1: "ru", "en", "de" и т.д.)'),
    theme: z
        .enum(['light', 'dark', 'system'])
        .optional()
        .describe('Тема оформления: light - светлая, dark - темная, system - как в системе'),
});

export const UserSchema = z.object({
    id: z.string().describe('Уникальный идентификатор (CUID/UUID)'),
    email: z.string().email().describe('Электронная почта'),
    profile: ProfileSchema,
    security: SecuritySchema,
    notifications: NotificationsSchema,
    preferences: PreferencesSchema,
});

export class UserResponse extends createZodDto(UserSchema) {}

export const UpdateProfileSchema = z
    .object({
        firstName: z
            .string()
            .min(1, 'Имя не может быть пустым')
            .max(50, 'Имя слишком длинное')
            .optional(),
        lastName: z
            .string()
            .min(1, 'Фамилия не может быть пустой')
            .max(50, 'Фамилия слишком длинная')
            .optional(),
        middleName: z.string().max(50, 'Отчество слишком длинное').nullish(),
        headline: z
            .string()
            .nullish()
            .describe('Краткий заголовок или должность (например: "Senior Developer @ Company")'),
        location: z.string().describe('Город или страна проживания').nullish(),
        phone: z.string().describe('Номер телефона (для связи)').nullish(),
        gender: z
            .enum(['none', 'male', 'female', 'non_binary', 'other', 'prefer_not_to_say'])
            .default('none')
            .optional()
            .describe(
                'Пол пользователя: none - не указан, male - мужской, female - женский, non_binary - небинарный, other - другой, prefer_not_to_say - предпочитаю не указывать',
            ),
        vacationStart: z.string().describe('Дата начала отпуска (ISO 8601)').nullish(),
        vacationEnd: z.string().describe('Дата окончания отпуска (ISO 8601)').nullish(),
        vacationMessage: z.string().nullish().describe('Сообщение автоответчика на время отпуска'),
        pronouns: z
            .enum(['he_him', 'she_her', 'they_them', 'other', 'none'])
            .default('none')
            .optional()
            .describe(
                'Предпочитаемые местоимения: he_him - он/его, she_her - она/ее, they_them - они/их, other - другие, none - не указаны',
            ),
        pronounsCustom: z
            .string()
            .max(50, 'Максимальная длина 50 символов')
            .nullish()
            .describe('Пользовательские местоимения (заполняется, если pronouns = "other")'),
        bio: z.string().max(1000, 'О себе не более 1000 символов').nullish(),
        timezone: z.string().max(50).optional(),
        language: z
            .string()
            .length(2, 'Используйте формат ISO (например, "ru" или "en")')
            .optional(),
        theme: z
            .enum(['light', 'dark', 'system'])
            .optional()
            .describe('Тема оформления: light - светлая, dark - темная, system - как в системе'),
    })
    .refine((data) => Object.keys(data).length > 0, {
        error: 'Необходимо передать хотя бы одно поле для обновления',
        abort: true,
    })
    .describe('Схема для частичного обновления данных профиля');

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}

const UserActivityItemSchema = z
    .object({
        id: z.string().describe('ID события активности'),
        eventType: z.string().describe('Тип события активности'),
        entityId: z.string().nullable().optional().describe('ID сущности, если применимо'),
        metadata: z
            .record(z.string(), z.unknown())
            .nullable()
            .optional()
            .describe('Дополнительные данные'),
        createdAt: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
                message: 'Строка не является валидной датой',
            })
            .describe('Дата и время события (ISO 8601)'),
    })
    .describe('Элемент активности пользователя');

export const UserActivityResponseSchema = createCursorResponseSchema(
    UserActivityItemSchema,
).describe('Ответ со списком активности пользователя');

export class UserActivityResponse extends createZodDto(UserActivityResponseSchema) {}
