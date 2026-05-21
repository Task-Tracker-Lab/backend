import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiForbidden, ApiNotFound, ApiUnauthorized, ApiValidationError } from '@shared/error';
import { ActionResponse } from '@shared/dtos';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';
import {
    BoardColumnResponse,
    BoardColumnsResponse,
    CreateBoardColumnDto,
    CreateBoardColumnResponse,
    UpdateBoardColumnDto,
} from '../../dtos';

export const FindAllBoardColumnsSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Получить список колонок доски' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'boardId', description: 'ID доски', type: 'string' }),
        ApiResponse({
            status: 200,
            description: 'Список колонок получен',
            type: BoardColumnsResponse.Output,
        }),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, BoardColumnsResponse),
    );

export const FindOneBoardColumnSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Получить колонку по ID' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'boardId', description: 'ID доски', type: 'string' }),
        ApiParam({ name: 'id', description: 'ID колонки', type: 'string' }),
        ApiResponse({
            status: 200,
            description: 'Колонка получена',
            type: BoardColumnResponse.Output,
        }),
        ApiNotFound('Колонка не найдена'),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, BoardColumnResponse),
    );

export const CreateBoardColumnSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Создать колонку в доске' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'boardId', description: 'ID доски', type: 'string' }),
        ApiBody({ type: CreateBoardColumnDto.Output }),
        ApiResponse({
            status: 201,
            description: 'Колонка создана',
            type: CreateBoardColumnResponse.Output,
        }),
        ApiValidationError(),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, CreateBoardColumnResponse),
    );

export const UpdateBoardColumnSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Обновить колонку' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'boardId', description: 'ID доски', type: 'string' }),
        ApiParam({ name: 'id', description: 'ID колонки', type: 'string' }),
        ApiBody({ type: UpdateBoardColumnDto.Output }),
        ApiResponse({
            status: 200,
            description: 'Колонка обновлена',
            type: ActionResponse.Output,
        }),
        ApiValidationError(),
        ApiNotFound('Колонка не найдена'),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const RemoveBoardColumnSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Удалить колонку' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'boardId', description: 'ID доски', type: 'string' }),
        ApiParam({ name: 'id', description: 'ID колонки', type: 'string' }),
        ApiResponse({
            status: 200,
            description: 'Колонка удалена',
            type: ActionResponse.Output,
        }),
        ApiNotFound('Колонка не найдена'),
        ApiUnauthorized(),
        ApiForbidden(),
        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );
