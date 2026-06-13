import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ActionResponse } from '@shared/dtos';
import {
    ApiValidationError,
    ApiUnauthorized,
    ApiForbidden,
    ApiNotFound,
    ApiConflict,
} from '@shared/error';
import {
    CreateProjectDto,
    CreateProjectResponse,
    CreateShareTokenDto,
    UpdateProjectDto,
    ProjectListResponse,
    ProjectDetailResponse,
} from '../../dtos';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';
import {
    CheckSlugResponse,
    CreateShareTokenResponse,
} from '@core/projects/application/dtos/project.dto';

export const CreateProjectSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Создать новый проект в команде',
            description: [
                'Создает проект с указанным названием и настройками.',
                'Slug генерируется автоматически из названия, если не передан явно.',
                'Создатель автоматически становится владельцем (owner) проекта.',
                'Настройки (settings) необязательны — если не переданы, создаются дефолтные.',
                'Требуется роль admin или owner в команде.',
            ].join('\n\n'),
        }),
        ApiParam({
            name: 'teamId',
            description: 'ID команды, в которой создается проект',
            type: 'string',
            example: 'clv123456',
        }),
        ApiBody({
            type: CreateProjectDto.Output,
            description: 'Данные проекта. Slug опционален — если не указан, генерируется из name.',
        }),
        ApiResponse({
            status: 201,
            description: 'Проект успешно создан',
            type: CreateProjectResponse.Output,
        }),
        ApiConflict('Проект с таким slug уже существует в команде'),
        ApiValidationError('Некорректные данные (slug, цвет, название)'),
        ApiForbidden('Недостаточно прав или достигнут лимит проектов'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, CreateProjectResponse),
    );

export const FindAllProjectsSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить список проектов команды',
            description: [
                'Возвращает все проекты, доступные пользователю в рамках команды.',
                'Включает как публичные проекты, так и те, где пользователь участник.',
                'Архивированные и удаленные проекты не возвращаются.',
                'Сортировка по полю sequence (по возрастанию).',
            ].join('\n\n'),
        }),
        ApiParam({
            name: 'teamId',
            description: 'ID команды',
            type: 'string',
            example: 'clv123456',
        }),
        ApiQuery({
            name: 'search',
            description: 'Поиск по названию проекта',
            type: 'string',
            required: false,
            example: 'маркетинг',
        }),
        ApiQuery({
            name: 'status',
            description: 'Фильтр по статусу проекта',
            type: 'string',
            required: false,
            enum: ['active', 'archived'],
            example: 'active',
        }),
        ApiResponse({
            status: 200,
            description: 'Список проектов получен',
            type: ProjectListResponse.Output,
        }),
        ApiForbidden('У вас нет доступа к этой команде'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ProjectListResponse),
    );

export const FindOneProjectSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить детальную информацию о проекте',
            description: [
                'Возвращает полную информацию о проекте, включая:',
                '- Основные поля (название, описание, статус)',
                '- Визуальные настройки (цвет, иконка)',
                '- Мета-информацию (счетчики, даты)',
                '- Права доступа текущего пользователя',
                '- Настройки проекта',
                '- Информацию о команде и владельце',
                '',
                'Проект должен принадлежать указанной команде.',
                'Пользователь должен иметь доступ к проекту (быть участником или проект публичный).',
            ].join('\n'),
        }),
        ApiParam({
            name: 'teamId',
            description: 'ID команды',
            type: 'string',
            example: 'clv123456',
        }),
        ApiParam({
            name: 'slug',
            description: 'Slug проекта (URL-идентификатор)',
            type: 'string',
            example: 'my-project',
        }),
        ApiResponse({
            status: 200,
            description: 'Детальная информация о проекте',
            type: ProjectDetailResponse.Output,
        }),
        ApiNotFound('Проект не найден в этой команде'),
        ApiForbidden('У вас нет доступа к этому проекту'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ProjectDetailResponse),
    );
export const UpdateProjectSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Обновить информацию о проекте',
            description: [
                'Частичное обновление проекта — можно передать только те поля, которые нужно изменить.',
                'Если поле не передано — оно остается без изменений.',
                'Для сброса опциональных полей (description, icon, color) передайте null.',
                '',
                'Особенности обновления slug:',
                '- Slug должен быть уникальным в рамках команды',
                '- При смене slug старые ссылки на проект становятся невалидными',
                '',
                'Обновление настроек (settings):',
                '- Если settings передан — обновляются только указанные поля',
                '- Не переданные поля настроек остаются без изменений',
                '',
                'Требуется роль owner или admin в проекте.',
            ].join('\n'),
        }),
        ApiParam({
            name: 'teamId',
            description: 'ID команды',
            type: 'string',
            example: 'clv123456',
        }),
        ApiParam({
            name: 'slug',
            description: 'Текущий slug проекта',
            type: 'string',
            example: 'my-project',
        }),
        ApiBody({
            type: UpdateProjectDto.Output,
            description: 'Поля для обновления. Все поля опциональны.',
        }),
        ApiResponse({
            status: 200,
            description: 'Проект успешно обновлен',
            type: ActionResponse.Output,
        }),
        ApiConflict('Проект с таким slug уже существует'),
        ApiValidationError('Некорректные данные'),
        ApiNotFound('Проект не найден'),
        ApiForbidden('Недостаточно прав'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const ArchiveProjectSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Архивировать проект',
            description: [
                'Переводит проект в статус "archived".',
                'Архивный проект:',
                '- Не отображается в общем списке проектов',
                '- Нельзя создавать новые задачи',
                '- Нельзя изменять существующие задачи',
                '- Можно только просматривать',
                '',
                'Перед архивацией проверяется отсутствие активных задач.',
                'Если в проекте есть незавершенные задачи — архивация будет отклонена.',
                '',
                'Требуется роль owner или admin в проекте.',
            ].join('\n'),
        }),
        ApiParam({
            name: 'teamId',
            description: 'ID команды',
            type: 'string',
            example: 'clv123456',
        }),
        ApiParam({
            name: 'slug',
            description: 'Slug проекта',
            type: 'string',
            example: 'my-project',
        }),
        ApiResponse({
            status: 200,
            description: 'Проект архивирован',
            type: ActionResponse.Output,
        }),
        ApiConflict('Проект уже в архиве или есть активные задачи'),
        ApiNotFound('Проект не найден'),
        ApiForbidden('Недостаточно прав'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const RemoveProjectSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Удалить проект (в корзину)',
            description: [
                'Мягкое удаление — проект перемещается в корзину (статус "deleted").',
                'Проект в корзине:',
                '- Не отображается нигде, кроме корзины',
                '- Недоступен для любых операций',
                '- Может быть восстановлен в течение 30 дней',
                '- Через 30 дней удаляется безвозвратно',
                '',
                'Перед удалением проект должен быть архивирован.',
                'Нельзя удалить активный проект напрямую.',
                '',
                'Требуется роль owner в проекте.',
            ].join('\n'),
        }),
        ApiParam({
            name: 'teamId',
            description: 'ID команды',
            type: 'string',
            example: 'clv123456',
        }),
        ApiParam({
            name: 'slug',
            description: 'Slug проекта',
            type: 'string',
            example: 'my-project',
        }),
        ApiResponse({
            status: 200,
            description: 'Проект перемещен в корзину',
            type: ActionResponse.Output,
        }),
        ApiConflict('Проект не архивирован или уже в корзине'),
        ApiNotFound('Проект не найден'),
        ApiForbidden('Недостаточно прав (требуется owner)'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const GetProjectByTokenSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить проект по публичной ссылке',
            description: [
                'Позволяет получить доступ к проекту без авторизации — по share-токену.',
                'Токен имеет ограниченный срок действия.',
                'Возвращает ту же структуру что и FindOne, но с ограниченными правами.',
                '',
                'Если токен истек — вернется 404.',
                'По share-ссылке доступен только просмотр, нельзя редактировать.',
            ].join('\n'),
        }),
        ApiParam({
            name: 'token',
            description: 'Публичный токен доступа к проекту',
            type: 'string',
            example: 'st_a1b2c3d4e5f6...',
        }),
        ApiResponse({
            status: 200,
            description: 'Проект получен по токену',
            type: ProjectDetailResponse.Output,
        }),
        ApiNotFound('Токен недействителен или истек'),
        ApiForbidden('Доступ по токену запрещен (проект приватный)'),

        SetMetadata(ZOD_RESPONSE_TOKEN, ProjectDetailResponse),
    );

export const CreateShareTokenSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Создать публичную ссылку на проект',
            description: [
                'Генерирует уникальный токен для публичного доступа к проекту.',
                'Токен можно передавать кому угодно — по нему открывается проект в режиме чтения.',
                '',
                'Срок действия:',
                '- Если ttl не указан — токен действует 3 месяца (по умолчанию)',
                '- Если ttl указан — токен действует до указанной даты',
                '- ttl не может быть в прошлом',
                '',
                'Безопасность:',
                '- Токен хешируется в БД (SHA-256), сырой токен показывается только при создании',
                '- Сохраните сырой токен сразу — потом его нельзя восстановить',
                '- Можно отозвать токен, удалив его из проекта',
                '',
                'Требуется роль owner или admin в проекте.',
            ].join('\n'),
        }),
        ApiParam({
            name: 'teamId',
            description: 'ID команды',
            type: 'string',
            example: 'clv123456',
        }),
        ApiParam({
            name: 'slug',
            description: 'Slug проекта',
            type: 'string',
            example: 'my-project',
        }),
        ApiBody({
            type: CreateShareTokenDto.Output,
            description: 'Настройки срока действия. ttl опционален.',
        }),
        ApiResponse({
            status: 201,
            description: 'Токен создан',
            type: CreateShareTokenResponse.Output,
        }),
        ApiValidationError('Некорректная дата (ttl в прошлом или невалидный формат)'),
        ApiNotFound('Проект не найден'),
        ApiForbidden('Недостаточно прав'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, CreateShareTokenResponse),
    );

export const CheckSlugSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Проверить доступность slug',
            description: [
                'Проверяет, свободен ли slug для создания нового проекта.',
                'Slug глобален — проверка по всем проектам, а не только внутри команды.',
                '',
                'Формат slug: строчные латинские буквы, цифры и дефисы (kebab-case).',
                'Пример: `my-project`, `marketing-2024`, `backend`',
            ].join('\n'),
        }),
        ApiQuery({
            name: 'q',
            description: 'Slug для проверки',
            type: 'string',
            required: true,
            example: 'my-project',
        }),
        ApiResponse({
            status: 200,
            description: 'Результат проверки',
            type: CheckSlugResponse.Output,
        }),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, CheckSlugResponse),
    );
