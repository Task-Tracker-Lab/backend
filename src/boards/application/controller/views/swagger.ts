import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiForbidden, ApiNotFound, ApiUnauthorized, ApiValidationError } from '@shared/error';
import { ActionResponse } from '@shared/dtos';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';
import {
    BoardViewResponse,
    BoardViewsResponse,
    CreateBoardViewDto,
    CreateBoardViewResponse,
    UpdateBoardViewDto,
} from '../../dtos';

export const FindAllBoardViewsSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Получить список представлений доски' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'boardId', description: 'ID доски', type: 'string' }),
        ApiResponse({
            status: 200,
            description: 'Список представлений получен',
            type: BoardViewsResponse.Output,
        }),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, BoardViewsResponse),
    );

export const FindOneBoardViewSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Получить представление по ID' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'boardId', description: 'ID доски', type: 'string' }),
        ApiParam({ name: 'id', description: 'ID представления', type: 'string' }),
        ApiResponse({
            status: 200,
            description: 'Представление получено',
            type: BoardViewResponse.Output,
        }),
        ApiNotFound('Представление не найдено'),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, BoardViewResponse),
    );

export const CreateBoardViewSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Создать представление в доске' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'boardId', description: 'ID доски', type: 'string' }),
        ApiBody({ type: CreateBoardViewDto.Output }),
        ApiResponse({
            status: 201,
            description: 'Представление создано',
            type: CreateBoardViewResponse.Output,
        }),
        ApiValidationError(),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, CreateBoardViewResponse),
    );

export const UpdateBoardViewSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Обновить представление' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'boardId', description: 'ID доски', type: 'string' }),
        ApiParam({ name: 'id', description: 'ID представления', type: 'string' }),
        ApiBody({ type: UpdateBoardViewDto.Output }),
        ApiResponse({
            status: 200,
            description: 'Представление обновлено',
            type: ActionResponse.Output,
        }),
        ApiValidationError(),
        ApiNotFound('Представление не найдено'),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const RemoveBoardViewSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Удалить представление' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'boardId', description: 'ID доски', type: 'string' }),
        ApiParam({ name: 'id', description: 'ID представления', type: 'string' }),
        ApiResponse({
            status: 200,
            description: 'Представление удалено',
            type: ActionResponse.Output,
        }),
        ApiNotFound('Представление не найдено'),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );
