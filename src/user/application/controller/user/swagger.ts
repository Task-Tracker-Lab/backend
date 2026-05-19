import { ApiBody, ApiExtraModels, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UpdateProfileDto, UserActivityResponse, UserResponse } from '../../dtos';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiUnauthorized, ApiValidationError } from '@shared/error';
import { ActionResponse } from '@shared/dtos';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';

export const GetMeSwagger = () =>
    applyDecorators(
        ApiExtraModels(UserResponse.Output),
        ApiOperation({
            summary: 'Получить профиль текущего пользователя',
            description:
                'Возвращает полную структуру профиля, включая вложенные объекты безопасности и настроек.',
        }),
        ApiResponse({
            status: 200,
            description: 'Данные профиля успешно получены.',
            type: UserResponse.Output,
        }),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, UserResponse),
    );

export const PatchMeSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Обновить данные профиля',
            description: 'Позволяет точечно обновить имя, bio, часовой пояс и язык интерфейса.',
        }),
        ApiBody({ type: UpdateProfileDto.Output }),
        ApiResponse({
            status: 200,
            description: 'Профиль успешно обновлен.',
            type: ActionResponse.Output,
        }),
        ApiValidationError('Ошибка валидации (например, слишком короткое имя)', [
            {
                field: 'fullName',
                message: 'Строка должна содержать минимум 2 символа',
                code: 'too_small',
            },
        ]),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const GetMeActivitySwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить ленту активности пользователя',
            description: 'Возвращает список последних действий пользователя (логи).',
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            type: String,
            description: 'Количество записей для вывода (по умолчанию 10)',
            example: '15',
        }),
        ApiResponse({
            status: 200,
            description: 'Список активностей успешно получен.',
            type: UserActivityResponse.Output,
        }),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, UserActivityResponse),
    );
