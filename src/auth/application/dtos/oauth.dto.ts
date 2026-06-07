import { z } from 'zod/v4';
import { createZodDto } from 'nestjs-zod';

const OAuthResponseSchema = z.object({
    id: z.string(),
    email: z.string().email().nonempty(),
    first_name: z.string().nonempty(),
    last_name: z.string().nullish(),
    avatar_url: z.string().nullish(),
    bio: z.string().nullish(),
    sex: z.enum(['male', 'female']).or(z.string()),
    provider: z.enum(['google', 'yandex', 'github', 'vkontakte']),
});

export class OAuthResponse extends createZodDto(OAuthResponseSchema) {}

export type TOAuthResponse = z.infer<typeof OAuthResponseSchema>;

export const ProviderSchema = z.object({
    label: z
        .string()
        .describe(
            'Человекочитаемое название провайдера для отображения на фронтенде (например, "Google", "Яндекс")',
        ),
    value: z
        .string()
        .describe(
            'Системный идентификатор провайдера, используемый в URL и логике бэкенда (например, "google", "yandex")',
        ),
});

export class ProvidersResponse extends createZodDto(z.array(ProviderSchema)) {}

export const ConnectedProviderSchema = z
    .object({
        email: z.string().describe('Email пользователя, полученный от OAuth-провайдера'),
        avatarUrl: z
            .string()
            .nullable()
            .describe(
                'URL аватара пользователя от провайдера (может быть пустым, если провайдер не предоставляет аватар)',
            ),
        provider: z
            .string()
            .describe('Название OAuth-провайдера (например, "google", "github", "facebook")'),
        connectedAt: z
            .string()
            .describe('Дата и время привязки провайдера в ISO 8601 формате (UTC)'),
    })
    .describe('Модель привязанного OAuth-провайдера для текущего пользователя');

export class ConnectedProviders extends createZodDto(z.array(ConnectedProviderSchema)) {}

export const ConnectProviderSchema = z.object({
    success: z.boolean().describe('Успешность выполнения запроса'),
    url: z.string().describe('URL для перенаправления на OAuth провайдера'),
});

export class ConnectProviderResponse extends createZodDto(ConnectProviderSchema) {}
