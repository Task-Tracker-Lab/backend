import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiUnauthorized, ApiValidationError } from '@shared/error';
import { ActionResponse } from '@shared/dtos';
import { UpdateNotificationsDto } from '../../dtos';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';

export const PatchMeNotificationsSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Обновить настройки уведомлений',
            description: 'Частичное обновление настроек email и push уведомлений.',
        }),
        ApiBody({
            type: UpdateNotificationsDto.Output,
        }),
        ApiResponse({
            status: 200,
            description: 'Настройки успешно сохранены.',
            type: ActionResponse.Output,
        }),
        ApiValidationError('Некорректный формат настроек'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );
