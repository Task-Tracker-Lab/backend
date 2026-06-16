export const OAuthErrorCodes = {
    INVALID_ACTION: 'OAUTH.INVALID_ACTION',
    PROVIDER_NOT_LINKED: 'OAUTH.PROVIDER_NOT_LINKED',
    PROVIDER_ALREADY_CONNECTED: 'OAUTH.PROVIDER_ALREADY_CONNECTED',
    PROVIDER_MISMATCH: 'OAUTH.PROVIDER_MISMATCH',
    INVALID_OR_EXPIRED_STATE: 'OAUTH.INVALID_OR_EXPIRED_STATE',
    LAST_AUTH_METHOD_CANNOT_BE_REMOVED: 'OAUTH.LAST_AUTH_METHOD_CANNOT_BE_REMOVED',
    EXCHANGE_TOKEN_INVALID: 'OAUTH.EXCHANGE_TOKEN_INVALID',
    PROVIDER_ALREADY_USED: 'OAUTH.PROVIDER_ALREADY_USED',
    EMAIL_ALREADY_EXISTS: 'OAUTH.EMAIL_ALREADY_EXISTS',
    ACTIVE_OAUTH_SESSION_EXISTS: 'OAUTH.ACTIVE_SESSION_EXISTS',
    DATA_CORRUPTION: 'OAUTH.DATA_CORRUPTION',
    SESSION_CREATION_FAILED: 'OAUTH.SESSION_CREATION_FAILED',
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
    [OAuthErrorCodes.PROVIDER_ALREADY_USED]: 'Провайдер уже привязан к другому пользователю',
    [OAuthErrorCodes.EMAIL_ALREADY_EXISTS]:
        'Пользователь с таким email уже существует. Войдите через пароль',
    [OAuthErrorCodes.ACTIVE_OAUTH_SESSION_EXISTS]: 'Активный процесс авторизации уже существует',
    [OAuthErrorCodes.DATA_CORRUPTION]: 'Ошибка целостности данных',
    [OAuthErrorCodes.SESSION_CREATION_FAILED]: 'Не удалось создать сессию',
};
