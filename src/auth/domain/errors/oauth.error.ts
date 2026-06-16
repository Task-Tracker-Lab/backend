export const OAuthErrorCodes = {
    INVALID_ACTION: 'OAUTH.INVALID_ACTION',
    PROVIDER_NOT_LINKED: 'OAUTH.PROVIDER_NOT_LINKED',
    PROVIDER_ALREADY_CONNECTED: 'OAUTH.PROVIDER_ALREADY_CONNECTED',
    PROVIDER_MISMATCH: 'OAUTH.PROVIDER_MISMATCH',
    INVALID_OR_EXPIRED_STATE: 'OAUTH.INVALID_OR_EXPIRED_STATE',
    LAST_AUTH_METHOD_CANNOT_BE_REMOVED: 'OAUTH.LAST_AUTH_METHOD_CANNOT_BE_REMOVED',
    EXCHANGE_TOKEN_INVALID: 'OAUTH.EXCHANGE_TOKEN_INVALID',
    EXCHANGE_DATA_CORRUPTED: 'OAUTH.EXCHANGE_DATA_CORRUPTED',
    PROVIDER_ALREADY_USED: 'OAUTH.PROVIDER_ALREADY_USED',
    EMAIL_ALREADY_EXISTS: 'OAUTH.EMAIL_ALREADY_EXISTS',
    OAUTH_LOGIN_NOT_FOUND: 'OAUTH.LOGIN_NOT_FOUND',
    ACTIVE_OAUTH_SESSION_EXISTS: 'OAUTH.ACTIVE_SESSION_EXISTS',
    UNAUTHORIZED: 'OAUTH.UNAUTHORIZED',
    DATA_CORRUPTION: 'OAUTH.DATA_CORRUPTION',
    SESSION_CREATION_FAILED: 'OAUTH.SESSION_CREATION_FAILED',
    SESSION_CREATION_INTERNAL_ERROR: 'OAUTH.SESSION_CREATION_INTERNAL_ERROR',
    PROVIDER_CONNECT_FAILED: 'OAUTH.PROVIDER_CONNECT_FAILED',
    PROVIDER_DISCONNECT_FAILED: 'OAUTH.PROVIDER_DISCONNECT_FAILED',
} as const;

export type OAuthErrorCode = (typeof OAuthErrorCodes)[keyof typeof OAuthErrorCodes];

export const OAuthErrorMessages: Record<OAuthErrorCode, string> = {
    [OAuthErrorCodes.INVALID_ACTION]: 'Неверное действие для OAuth операции',
    [OAuthErrorCodes.PROVIDER_NOT_LINKED]: 'Провайдер не привязан к пользователю',
    [OAuthErrorCodes.PROVIDER_ALREADY_CONNECTED]: 'Провайдер уже подключен к аккаунту',
    [OAuthErrorCodes.PROVIDER_MISMATCH]: 'Провайдер в запросе не совпадает с ожидаемым',
    [OAuthErrorCodes.INVALID_OR_EXPIRED_STATE]: 'Сессия подключения недействительна или истекла',
    [OAuthErrorCodes.LAST_AUTH_METHOD_CANNOT_BE_REMOVED]:
        'Нельзя удалить последний способ входа. Установите пароль или добавьте другой провайдер',
    [OAuthErrorCodes.EXCHANGE_TOKEN_INVALID]: 'Токен обмена недействителен или истёк',
    [OAuthErrorCodes.EXCHANGE_DATA_CORRUPTED]: 'Неверный формат данных авторизации',
    [OAuthErrorCodes.PROVIDER_ALREADY_USED]: 'Провайдер уже привязан к другому пользователю',
    [OAuthErrorCodes.EMAIL_ALREADY_EXISTS]:
        'Пользователь с таким email уже существует. Войдите через пароль',
    [OAuthErrorCodes.OAUTH_LOGIN_NOT_FOUND]: 'Пользователь с таким OAuth аккаунтом не найден',
    [OAuthErrorCodes.ACTIVE_OAUTH_SESSION_EXISTS]: 'Активный процесс авторизации уже существует',
    [OAuthErrorCodes.UNAUTHORIZED]: 'Необходима авторизация',
    [OAuthErrorCodes.DATA_CORRUPTION]: 'Ошибка целостности данных',
    [OAuthErrorCodes.SESSION_CREATION_FAILED]: 'Не удалось создать сессию',
    [OAuthErrorCodes.SESSION_CREATION_INTERNAL_ERROR]: 'Внутренняя ошибка при создании сессии',
    [OAuthErrorCodes.PROVIDER_CONNECT_FAILED]: 'Не удалось привязать провайдера',
    [OAuthErrorCodes.PROVIDER_DISCONNECT_FAILED]: 'Не удалось отвязать провайдера',
};
