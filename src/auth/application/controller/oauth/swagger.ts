import { OAuthProvider } from '@core/auth/infrastructure/constants';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
    ApiBadRequest,
    ApiConflict,
    ApiForbidden,
    ApiUnauthorized,
    ApiValidationError,
} from '@shared/error';
import { ConnectedProviders, ConnectProviderResponse, ProvidersResponse } from '../../dtos';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';
import { ActionResponse } from '@shared/dtos';

export const OAuthLoginSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Инициализация OAuth авторизации',
            description:
                'Перенаправляет пользователя на страницу аутентификации выбранного провайдера (google, github и т.д.).',
        }),
        ApiParam({
            name: 'provider',
            description: 'Название OAuth провайдера',
            enum: OAuthProvider,
        }),
        ApiResponse({
            status: 302,
            description: 'Успешное перенаправление на сторону провайдера.',
        }),
        ApiBadRequest('Указан незарегистрированный или неподдерживаемый провайдер'),
    );

export const OAuthCallbackSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Callback для завершения OAuth авторизации',
            description:
                'Обрабатывает ответ от провайдера, аутентифицирует пользователя, устанавливает refresh-токен в httpOnly cookie и возвращает результат.',
        }),
        ApiParam({
            name: 'provider',
            description: 'Название OAuth провайдера',
            enum: OAuthProvider,
        }),
        ApiResponse({
            status: 302,
            description: 'Успешный вход. Перенаправление на фронтенд с параметрами авторизации.',
            headers: {
                Location: {
                    description:
                        'URL фронтенда с query-параметрами. Пример: https://frontend.com/oauth?success=true&access=ey...',
                    schema: {
                        type: 'string',
                    },
                },
            },
        }),
        ApiUnauthorized('Ошибка авторизации через сторонний сервис'),
        ApiValidationError('Данные от провайдера не прошли валидацию'),
    );

export const GetOAuthProvidersSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить список активных OAuth провайдеров',
            description:
                'Возвращает массив провайдеров, которые сейчас настроены на бэкенде (активны в .env). Используется фронтендом для динамической отрисовки кнопок входа.',
        }),
        ApiResponse({
            status: 200,
            description: 'Список доступных провайдеров со ссылками на их иконки.',
            type: ProvidersResponse.Output,
        }),

        SetMetadata(ZOD_RESPONSE_TOKEN, ProvidersResponse),
    );

export const ConnectOAuthProviderSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Привязать OAuth провайдера к аккаунту',
            description:
                'Позволяет аутентифицированному пользователю привязать внешний OAuth-провайдер (Google, GitHub и т.д.) к своему существующему аккаунту. Полезно для добавления дополнительных способов входа.',
        }),
        ApiParam({
            name: 'provider',
            description: 'Название OAuth провайдера для привязки',
            enum: OAuthProvider,
            required: true,
        }),
        ApiResponse({
            status: 200,
            description: 'Провайдер успешно привязан к аккаунту.',
            type: [ConnectProviderResponse.Output],
        }),
        ApiBadRequest(
            'Провайдер уже привязан к этому аккаунту или указан неподдерживаемый провайдер',
        ),
        ApiConflict(
            'Конфликт: провайдер уже используется другим пользователем (например, Google аккаунт уже привязан к другому пользователю в системе)',
        ),
        ApiUnauthorized(),
        ApiValidationError(),
        SetMetadata(ZOD_RESPONSE_TOKEN, ConnectProviderResponse),
    );

export const DisconnectOAuthProviderSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Отвязать OAuth провайдера от аккаунта',
            description:
                'Удаляет привязку OAuth-провайдера от текущего аккаунта пользователя. Важно: если это был единственный способ входа (и нет пароля), операция будет отклонена, чтобы пользователь не потерял доступ.',
        }),
        ApiParam({
            name: 'provider',
            description: 'Название OAuth провайдера для отвязки',
            enum: OAuthProvider,
            required: true,
        }),
        ApiResponse({
            status: 200,
            description: 'Провайдер успешно отвязан от аккаунта.',
            type: ActionResponse.Output,
        }),
        ApiForbidden(
            'Запрещено: нельзя отвязать единственный способ входа (останетесь без доступа к аккаунту)',
        ),
        ApiBadRequest(
            'Провайдер не привязан к этому аккаунту или указан неподдерживаемый провайдер',
        ),
        ApiUnauthorized(),
        ApiValidationError(),
        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const GetConnectedProvidersSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить список привязанных OAuth провайдеров пользователя',
            description:
                'Возвращает массив OAuth-провайдеров, которые уже привязаны к текущему аккаунту пользователя. Используется на странице настроек аккаунта для отображения статуса привязок.',
        }),
        ApiResponse({
            status: 200,
            description: 'Список привязанных провайдеров с метаданными.',
            type: ConnectedProviders.Output,
        }),
        ApiUnauthorized('Пользователь не авторизован'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ConnectedProviders),
    );
