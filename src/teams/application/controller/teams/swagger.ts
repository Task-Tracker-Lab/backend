import { CreateTeamResponse } from '@core/teams/application/dtos/team.dto';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ActionResponse } from '@shared/dtos';
import { ApiForbidden, ApiNotFound, ApiUnauthorized, ApiValidationError } from '@shared/error';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';

import { CreateTeamDto, UpdateTeamDto, TeamResponse } from '../../dtos';

export const CreateTeamSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Создать новую команду' }),
        ApiBody({ type: CreateTeamDto.Output }),
        ApiResponse({
            status: 201,
            description: 'Команда успешно создана',
            type: CreateTeamResponse.Output,
        }),
        ApiValidationError(),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, CreateTeamResponse),
    );

export const FindOneTeamSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Получить детальную информацию о команде' }),
        ApiParam({ name: 'id', description: 'Уникальный идентификатор команды' }),
        ApiResponse({
            status: 200,
            description: 'Данные команды получены',
            type: TeamResponse.Output,
        }),
        ApiNotFound('Команда не найдена'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, TeamResponse),
    );

export const UpdateTeamSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Обновить данные команды' }),
        ApiBody({ type: UpdateTeamDto.Output }),
        ApiParam({
            name: 'id',
            description: 'Уникальный идентификатор команды для редактирования',
        }),
        ApiResponse({
            status: 200,
            description: 'Команда успешно обновлена',
            type: ActionResponse.Output,
        }),
        ApiForbidden(),
        ApiNotFound(),
        ApiValidationError(),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const RemoveTeamSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Удалить команду' }),
        ApiParam({ name: 'id', description: 'Уникальный идентификатор команды для удаления' }),
        ApiResponse({
            status: 200,
            description: 'Команда успешно удалена',
            type: ActionResponse.Output,
        }),
        ApiForbidden(),
        ApiNotFound(),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );
