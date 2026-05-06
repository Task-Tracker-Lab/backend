import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiForbidden, ApiNotFound, ApiUnauthorized, ApiValidationError } from '@shared/error';
import { BoardResponse, CreateBoardDto, UpdateBoardDto } from '../../dtos';

export const FindAllBoardsSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Получить список досок проекта' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiResponse({
            status: 200,
            description: 'Список досок получен',
            type: [BoardResponse.Output],
        }),
        ApiUnauthorized(),
        ApiForbidden(),
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
    );

export const CreateBoardSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Создать доску в проекте' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiBody({ type: CreateBoardDto.Output }),
        ApiResponse({
            status: 201,
            description: 'Доска успешно создана',
            type: BoardResponse.Output,
        }),
        ApiValidationError(),
        ApiUnauthorized(),
        ApiForbidden(),
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
            type: BoardResponse.Output,
        }),
        ApiValidationError(),
        ApiNotFound('Доска не найдена'),
        ApiUnauthorized(),
        ApiForbidden(),
    );

export const RemoveBoardSwagger = () =>
    applyDecorators(
        ApiOperation({ summary: 'Удалить доску' }),
        ApiParam({ name: 'projectId', description: 'ID проекта', type: 'string' }),
        ApiParam({ name: 'id', description: 'ID доски', type: 'string' }),
        ApiResponse({
            status: 200,
            description: 'Доска удалена',
            type: Boolean,
        }),
        ApiNotFound('Доска не найдена'),
        ApiUnauthorized(),
        ApiForbidden(),
    );
