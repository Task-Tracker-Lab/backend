import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiForbidden, ApiNotFound, ApiUnauthorized, ApiValidationError } from '@shared/error';
import { ActionResponse } from '@shared/dtos';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';
import {
    BoardListResponse,
    BoardResponse,
    CreateBoardDto,
    CreateBoardResponse,
    UpdateBoardDto,
} from '../../dtos';

export const FindAllBoardsSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Получить список досок проекта' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiResponse({
            status: 200,
            description: 'Список досок получен',
            type: BoardListResponse.Output,
        }),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, BoardListResponse),
    );

export const FindOneBoardSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Получить доску по ID' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'id', description: 'ID доски', type: 'string' }),
        ApiResponse({
            status: 200,
            description: 'Данные доски получены',
            type: BoardResponse.Output,
        }),
        ApiNotFound('Доска не найдена'),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, BoardResponse),
    );

export const CreateBoardSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Создать доску в проекте' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiBody({ type: CreateBoardDto.Output }),
        ApiResponse({
            status: 201,
            description: 'Доска успешно создана',
            type: CreateBoardResponse.Output,
        }),
        ApiValidationError(),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, CreateBoardResponse),
    );

export const UpdateBoardSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Обновить доску' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'id', description: 'ID доски', type: 'string' }),
        ApiBody({ type: UpdateBoardDto.Output }),
        ApiResponse({
            status: 200,
            description: 'Доска обновлена',
            type: ActionResponse.Output,
        }),
        ApiValidationError(),
        ApiNotFound('Доска не найдена'),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const RemoveBoardSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Удалить доску' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'id', description: 'ID доски', type: 'string' }),
        ApiResponse({
            status: 200,
            description: 'Доска удалена',
            type: ActionResponse.Output,
        }),
        ApiNotFound('Доска не найдена'),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );
