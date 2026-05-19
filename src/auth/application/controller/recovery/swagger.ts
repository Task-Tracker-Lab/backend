import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
    ApiBadRequest,
    ApiErrorResponse,
    ApiForbidden,
    ApiNotFound,
    ApiUnauthorized,
    ApiValidationError,
} from '@shared/error';
import {
    ChangePasswordDto,
    Confirm2FaDto,
    Disable2FaDto,
    PasswordResetConfirmDto,
    ResetPasswordDto,
    VerifyResetCodeDto,
    Enable2FaResponse,
    SessionsResponse,
    SessionResponse,
} from '../../dtos';
import { ActionResponse } from '@shared/dtos';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';

export const PostPasswordResetSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Запрос кода восстановления пароля',
            description: 'Отправляет одноразовый код на email, если пользователь существует.',
        }),
        ApiBody({ type: ResetPasswordDto.Output }),
        ApiResponse({
            status: 201,
            description: 'Код отправлен на почту (при успешной обработке запроса).',
            type: ActionResponse.Output,
        }),
        ApiValidationError('Некорректный формат email'),
        ApiErrorResponse(
            422,
            'INVALID_EMAIL_FORMAT',
            'Указанный email адрес имеет некорректный формат',
        ),
        ApiNotFound('Пользователь с таким email не найден'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const PostPasswordResetVerifySwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Проверка кода восстановления пароля',
            description: 'Проверяет код из письма и помечает сессию сброса как подтверждённую.',
        }),
        ApiBody({ type: VerifyResetCodeDto.Output }),
        ApiResponse({
            status: 201,
            description: 'Код подтверждён, можно задать новый пароль.',
            type: ActionResponse.Output,
        }),
        ApiValidationError('Ошибка валидации (email или формат кода)'),
        ApiBadRequest('Время подтверждения истекло или запрос не найден'),
        ApiBadRequest('Неверный или истёкший код подтверждения'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const PostPasswordResetConfirmSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Установка нового пароля после сброса',
            description: 'Доступно только после успешной проверки кода на шаге verify.',
        }),
        ApiBody({ type: PasswordResetConfirmDto.Output }),
        ApiResponse({
            status: 201,
            description: 'Пароль успешно изменён.',
            type: ActionResponse.Output,
        }),
        ApiValidationError('Ошибка валидации (пароли не совпадают или неверная длина)'),
        ApiBadRequest('Сессия восстановления не найдена или истекла'),
        ApiForbidden(),
        ApiErrorResponse(
            500,
            'PASSWORD_UPDATE_FAILED',
            'Не удалось обновить пароль. Попробуйте позже.',
        ),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const GetSessionsSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить активные сессии',
            description: 'Возвращает список всех активных устройств/сессий пользователя.',
        }),
        ApiResponse({
            status: 200,
            description: 'Список сессий успешно получен.',
            type: [SessionResponse.Output],
        }),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, SessionsResponse),
    );

export const DeleteSessionSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Завершить чужую сессию',
            description: 'Принудительно удаляет указанную сессию из Redis.',
        }),
        ApiParam({ name: 'cuid', description: 'ID сессии, которую нужно завершить' }),
        ApiResponse({
            status: 200,
            description: 'Сессия успешно завершена.',
            type: ActionResponse.Output,
        }),
        ApiUnauthorized(),
        ApiForbidden(),
        ApiNotFound('Сессия не найдена или уже истекла'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const PostChangePasswordSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Смена пароля',
            description: 'Требует текущий и новый пароль. Инвалидирует все остальные сессии.',
        }),
        ApiBody({ type: ChangePasswordDto.Output }),
        ApiResponse({
            status: 200,
            description: 'Пароль успешно изменен.',
            type: ActionResponse.Output,
        }),
        ApiBadRequest('Неверный старый пароль'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const PostEnable2faSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Генерация QR-кода для 2FA',
            description: 'Создает секрет и возвращает ссылку (otpauth) для Google Authenticator.',
        }),
        ApiResponse({
            status: 200,
            description: 'QR-код сгенерирован.',
            type: Enable2FaResponse.Output,
        }),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, Enable2FaResponse),
    );

export const PostDisable2faSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Подтверждение включения 2FA',
            description: 'Проверяет первый код из приложения для окончательной активации 2FA.',
        }),
        ApiBody({ type: Confirm2FaDto.Output }),
        ApiResponse({
            status: 200,
            description: 'Двухфакторная аутентификация успешно включена.',
            type: ActionResponse.Output,
        }),
        ApiBadRequest('Неверный код подтверждения'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const PostConfirm2faSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Отключение 2FA',
            description:
                'Отключает двухфакторную аутентификацию (требует подтверждения паролем или текущим кодом).',
        }),
        ApiBody({ type: Disable2FaDto.Output }),
        ApiResponse({
            status: 200,
            description: '2FA успешно отключена.',
            type: ActionResponse.Output,
        }),
        ApiBadRequest('Неверный код или пароль для отключения'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );
