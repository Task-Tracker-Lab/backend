import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ActionResponse } from '@shared/dtos';
import {
    ApiUnauthorized,
    ApiNotFound,
    ApiValidationError,
    ApiForbidden,
    ApiConflict,
} from '@shared/error';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';

export const FindAllProjectStatesSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить все состояния проекта',
            description: 'Возвращает список всех статусов (колонок) проекта с их настройками',
        }),
        ApiParam({
            name: 'projectId',
            type: 'string',
            description: 'CUID проекта',
            example: 'clv123456',
        }),
        ApiQuery({
            name: 'hidden',
            required: false,
            type: Boolean,
            description: 'Показать скрытые статусы',
            example: 'false',
        }),
        ApiQuery({
            name: 'category',
            required: false,
            enum: ['backlog', 'active', 'review', 'completed', 'archived'],
            description: 'Фильтр по категории статусов',
            example: 'active',
        }),
        ApiQuery({
            name: 'counts',
            required: false,
            type: Boolean,
            description: 'Добавить количество задач в каждом статусе (tasksCount)',
            example: 'true',
        }),
        ApiQuery({
            name: 'my',
            required: false,
            type: Boolean,
            description: 'Показать только мои задачи (добавляет myTasksCount)',
            example: 'false',
        }),
        ApiQuery({
            name: 'overdue',
            required: false,
            type: Boolean,
            description:
                'Добавить информацию о просроченных задачах (hasOverdueTasks, overdueTasksCount)',
            example: 'true',
        }),
        ApiResponse({
            status: 200,
            description: 'Список состояний получен',
            // type: ProjectStateListResponse.Output,
        }),
        ApiUnauthorized(),
        ApiNotFound('Проект не найден'),

        // SetMetadata(ZOD_RESPONSE_TOKEN, ProjectStateListResponse),
    );

export const FindOneProjectStateSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить детальную информацию о состоянии',
            description: 'Возвращает полную информацию о статусе проекта',
        }),
        ApiParam({
            name: 'projectId',
            type: 'string',
            description: 'CUID проекта',
            example: 'clv123456',
        }),
        ApiParam({
            name: 'stateId',
            type: 'string',
            description: 'CUID состояния',
            example: 'clv789012',
        }),
        ApiResponse({
            status: 200,
            description: 'Информация о состоянии получена',
            // type: ProjectStateDetailResponse.Output,
        }),
        ApiNotFound('Состояние не найдено'),
        ApiUnauthorized(),

        // SetMetadata(ZOD_RESPONSE_TOKEN, ProjectStateDetailResponse),
    );

export const CreateProjectStateSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Создать новое состояние',
            description:
                'Создаёт новый статус (колонку) для проекта. Можно указать тип, иконку, цвет и WIP лимит.',
        }),
        ApiParam({
            name: 'projectId',
            type: 'string',
            description: 'CUID проекта',
            example: 'clv123456',
        }),
        ApiBody({
            // type: CreateProjectStateDto.Output,
            description: 'Данные для создания состояния',
        }),
        ApiResponse({
            status: 201,
            description: 'Состояние успешно создано',
            // type: CreateProjectStateResponse.Output,
        }),
        ApiValidationError(),
        ApiUnauthorized(),
        ApiForbidden('Нет прав для создания состояния в этом проекте'),
        ApiConflict('Состояние с таким названием или типом уже существует'),

        // SetMetadata(ZOD_RESPONSE_TOKEN, CreateProjectStateResponse),
    );

export const UpdateProjectStateSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Обновить состояние',
            description:
                'Обновляет параметры статуса. Системные статусы (isLocked=true) нельзя переименовать, но можно изменить визуал.',
        }),
        ApiParam({
            name: 'projectId',
            type: 'string',
            description: 'CUID проекта',
            example: 'clv123456',
        }),
        ApiParam({
            name: 'stateId',
            type: 'string',
            description: 'CUID состояния',
            example: 'clv789012',
        }),
        ApiBody({
            // type: UpdateProjectStateDto.Output,
            description: 'Обновляемые поля',
        }),
        ApiResponse({
            status: 200,
            description: 'Состояние обновлено',
            // type: UpdateProjectStateResponse.Output,
        }),
        ApiValidationError(),
        ApiNotFound('Состояние не найдено'),
        ApiUnauthorized(),
        ApiForbidden('Нельзя изменить системный статус'),
        ApiConflict('Состояние с таким названием уже существует'),

        // SetMetadata(ZOD_RESPONSE_TOKEN, UpdateProjectStateResponse),
    );

export const ReorderProjectStatesSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Переупорядочить состояния',
            description:
                'Меняет порядок колонок на доске. Принимает массив ID состояний в новом порядке.',
        }),
        ApiParam({
            name: 'projectId',
            type: 'string',
            description: 'CUID проекта',
            example: 'clv123456',
        }),
        ApiBody({
            // type: ReorderStatesDto.Output,
            description: 'Массив ID состояний в правильном порядке',
        }),
        ApiResponse({
            status: 200,
            description: 'Порядок обновлён',
            // type: ReorderStatesResponse.Output,
        }),
        ApiValidationError(),
        ApiNotFound('Одно или несколько состояний не найдены'),
        ApiUnauthorized(),
        ApiForbidden('Нет прав для изменения порядка'),

        // SetMetadata(ZOD_RESPONSE_TOKEN, ReorderStatesResponse),
    );

export const RemoveProjectStateSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Удалить состояние',
            description:
                'Мягкое удаление статуса. Статус можно удалить только если в нём нет задач.',
        }),
        ApiParam({
            name: 'projectId',
            type: 'string',
            description: 'CUID проекта',
            example: 'clv123456',
        }),
        ApiParam({
            name: 'stateId',
            type: 'string',
            description: 'CUID состояния',
            example: 'clv789012',
        }),
        ApiResponse({
            status: 200,
            description: 'Состояние удалено',
            type: ActionResponse.Output,
        }),
        ApiNotFound('Состояние не найдено'),
        ApiUnauthorized(),
        ApiForbidden('Нельзя удалить системный статус'),
        ApiConflict('Нельзя удалить статус, в котором есть задачи'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const RestoreProjectStateSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Восстановить удалённое состояние',
            description: 'Восстанавливает мягко удалённый статус',
        }),
        ApiParam({
            name: 'projectId',
            type: 'string',
            description: 'CUID проекта',
            example: 'clv123456',
        }),
        ApiParam({
            name: 'stateId',
            type: 'string',
            description: 'CUID состояния',
            example: 'clv789012',
        }),
        ApiResponse({
            status: 200,
            description: 'Состояние восстановлено',
            type: ActionResponse.Output,
        }),
        ApiNotFound('Удалённое состояние не найдено'),
        ApiUnauthorized(),
        ApiForbidden('Нет прав для восстановления'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const GetProjectStatesStatsSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить статистику по состояниям',
            description: 'Возвращает количество задач в каждом статусе и метрики WIP',
        }),
        ApiParam({
            name: 'projectId',
            type: 'string',
            description: 'CUID проекта',
            example: 'clv123456',
        }),
        ApiResponse({
            status: 200,
            description: 'Статистика получена',
            schema: {
                type: 'object',
                properties: {
                    data: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                stateId: { type: 'string' },
                                title: { type: 'string' },
                                stateType: { type: 'string' },
                                tasksCount: { type: 'integer' },
                                maxTasksLimit: { type: 'integer', nullable: true },
                                isOverLimit: { type: 'boolean' },
                                averageTimeInState: { type: 'integer', nullable: true },
                            },
                        },
                    },
                },
            },
        }),
        ApiUnauthorized(),
        ApiNotFound('Проект не найден'),
    );
