import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiUnauthorized } from '@shared/error';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';

import { UserTeamsResponse, UserInvitesResponse } from '../../dtos';

export const FindTeamsSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить список команд пользователя',
            description:
                'Возвращает все команды, в которых текущий пользователь является участником или владельцем.',
        }),
        ApiResponse({
            status: 200,
            description: 'Список команд получен',
            type: UserTeamsResponse.Output,
        }),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, UserTeamsResponse),
    );

export const FindInvitesSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить список входящих приглашений',
            description:
                'Возвращает все активные приглашения в команды, отправленные на email текущего пользователя.',
        }),
        ApiResponse({
            status: 200,
            description: 'Список приглашений успешно получен',
            type: UserInvitesResponse.Output,
        }),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, UserInvitesResponse),
    );
