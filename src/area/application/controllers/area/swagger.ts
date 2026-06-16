import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
    ApiUnauthorized,
    ApiNotFound,
    ApiValidationError,
    ApiForbidden,
    ApiConflict,
} from '@shared/error';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';
import { ActionResponse } from '@shared/schemas';

import { CreateAreaDto, UpdateAreaDto, AreaResponse, AreasResponse } from '../../dtos';

export const CreateAreaSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Создать область (пространство) внутри проекта',
            description: [
                'Создаёт новую область — это как отдельная доска или пространство внутри вашего проекта.',
                '',
                'Пример: в проекте разработки ПО можно создать области:',
                '- «Бэкенд»',
                '- «Фронтенд»',
                '- «Дизайн»',
                '- «Документация»',
                '',
                'У каждой области свой workflow (свои колонки-статусы), настройки и права доступа.',
                'Области позволяют изолировать разные направления работы внутри одного проекта.',
            ].join('\n'),
        }),
        ApiParam({
            name: 'slug',
            type: 'string',
            description: 'Slug проекта',
            example: 'super-project',
        }),
        ApiBody({
            type: CreateAreaDto.Output,
            description: 'Данные для создания области',
        }),
        ApiResponse({
            status: 201,
            description: 'Область успешно создана',
            type: ActionResponse.Output,
        }),
        ApiValidationError(),
        ApiUnauthorized(),
        ApiForbidden('Нет прав для создания области в этом проекте'),
        ApiConflict('Область с таким названием или slug уже существует'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const FindAllAreasSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить список всех областей в проекте',
            description: [
                'Возвращает все области (пространства) внутри проекта с их настройками.',
                'Это как посмотреть все доски в проекте.',
                '',
                'Доступные фильтры:',
                '- `deleted=true` — показать мягко удалённые области',
                '- `includeCounts=true` — добавить количество задач в каждой области',
                '',
                'Полезно для навигации по проекту и отображения сводки по всем направлениям работы.',
            ].join('\n'),
        }),
        ApiParam({
            name: 'slug',
            type: 'string',
            description: 'Slug проекта',
            example: 'super-project',
        }),
        ApiQuery({
            name: 'deleted',
            required: false,
            type: Boolean,
            description: 'Показать мягко удалённые области',
            example: 'false',
        }),
        ApiQuery({
            name: 'includeCounts',
            required: false,
            type: Boolean,
            description: 'Добавить количество задач в каждой области (tasksCount)',
            example: 'true',
        }),
        ApiResponse({
            status: 200,
            description: 'Список областей получен',
            type: AreasResponse.Output,
        }),
        ApiUnauthorized(),
        ApiNotFound('Проект не найден'),

        SetMetadata(ZOD_RESPONSE_TOKEN, AreasResponse),
    );

export const FindOneAreaSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить детали конкретной области',
            description: [
                'Возвращает полную информацию об одной области по её slug или ID.',
                'Вы можете обратиться как по человекопонятному slug, так и по внутреннему ID.',
                '',
                'Информация включает:',
                '- название',
                '- описание',
                '- цвет и иконку',
                '- настройки workflow',
                '- количество задач и метрики по области',
                '',
                'По сути, это получение всех настроек конкретной доски.',
            ].join('\n'),
        }),
        ApiParam({
            name: 'slug',
            type: 'string',
            description: 'Slug проекта',
            example: 'super-project',
        }),
        ApiParam({
            name: 'key',
            type: 'string',
            description: 'Slug или ID области',
            example: 'development',
        }),
        ApiResponse({
            status: 200,
            description: 'Информация об области получена',
            type: AreaResponse.Output,
        }),
        ApiNotFound('Область не найдена'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, AreaResponse),
    );

export const UpdateAreaSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Обновить настройки области',
            description: [
                'Изменяет параметры существующей области.',
                '',
                'Что можно изменить:',
                '- название',
                '- описание',
                '- цветовую метку',
                '- иконку',
                '- лимит задач (максимум задач в этой области)',
                '- другие настройки',
                '',
                'Пример: переименовать область «Дизайн» в «Дизайн и прототипирование»',
                'или изменить её цвет в интерфейсе.',
            ].join('\n'),
        }),
        ApiParam({
            name: 'slug',
            type: 'string',
            description: 'Slug проекта',
            example: 'super-project',
        }),
        ApiParam({
            name: 'key',
            type: 'string',
            description: 'Slug или ID области',
            example: 'development',
        }),
        ApiBody({
            type: UpdateAreaDto.Output,
            description: 'Обновляемые поля',
        }),
        ApiResponse({
            status: 200,
            description: 'Область обновлена',
            type: ActionResponse.Output,
        }),
        ApiValidationError(),
        ApiNotFound('Область не найдена'),
        ApiUnauthorized(),
        ApiForbidden('Нет прав для обновления этой области'),
        ApiConflict('Область с таким названием или slug уже существует'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const DeleteAreaSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Удалить область',
            description: [
                'Мягкое удаление области — она перестаёт отображаться, но данные сохраняются.',
                '',
                'Важные ограничения:',
                '- удалить область можно только если в ней НЕТ задач',
                '- это защита от случайной потери данных',
                '',
                'Если в области есть задачи:',
                '- их нужно сначала переместить в другую область',
                '- или удалить',
                '',
                'Удалённую область можно потом восстановить через метод восстановления.',
            ].join('\n'),
        }),
        ApiParam({
            name: 'slug',
            type: 'string',
            description: 'Slug проекта',
            example: 'super-project',
        }),
        ApiParam({
            name: 'key',
            type: 'string',
            description: 'Slug или ID области',
            example: 'development',
        }),
        ApiResponse({
            status: 200,
            description: 'Область удалена',
            type: ActionResponse.Output,
        }),
        ApiNotFound('Область не найдена'),
        ApiUnauthorized(),
        ApiForbidden('Нет прав для удаления этой области'),
        ApiConflict('Нельзя удалить область, в которой есть задачи'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const RestoreAreaSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Восстановить удалённую область',
            description: [
                'Восстанавливает мягко удалённую область.',
                '',
                'Что восстанавливается:',
                '- сама область',
                '- все её состояния (колонки на доске)',
                '',
                'Что НЕ восстанавливается автоматически:',
                '- задачи, которые были в области',
                '',
                'Полезно, если:',
                '- область удалили по ошибке',
                '- решили вернуть архивное направление работы',
            ].join('\n'),
        }),
        ApiParam({
            name: 'slug',
            type: 'string',
            description: 'Slug проекта',
            example: 'super-project',
        }),
        ApiParam({
            name: 'key',
            type: 'string',
            description: 'Slug или ID области',
            example: 'development',
        }),
        ApiResponse({
            status: 200,
            description: 'Область восстановлена',
            type: ActionResponse.Output,
        }),
        ApiNotFound('Удалённая область не найдена'),
        ApiUnauthorized(),
        ApiForbidden('Нет прав для восстановления'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );
