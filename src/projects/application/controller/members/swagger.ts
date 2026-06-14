import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ActionResponse } from '@shared/dtos';
import { ApiForbidden, ApiNotFound, ApiUnauthorized, ApiValidationError } from '@shared/error';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';
import { AddProjectMemberDto, ListMembersResponse, UpdateProjectMemberDto } from '../../dtos';

export const FindAllMembersSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Получить список участников проекта',
            description: [
                'Возвращает всех активных участников проекта с их ролями.',
                'Доступно участникам с любой ролью, включая viewer.',
            ].join('\n\n'),
        }),
        ApiParam({
            name: 'slug',
            description: 'Slug проекта',
            type: 'string',
            example: 'my-project',
        }),
        ApiResponse({
            status: 200,
            description: 'Список участников получен',
            type: ListMembersResponse.Output,
        }),
        ApiNotFound('Проект не найден'),
        ApiForbidden('У вас нет доступа к этому проекту'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ListMembersResponse),
    );

export const FindAvailableUsersSwagger = () =>
    applyDecorators(
        ApiOperation({
            deprecated: true,
            summary: 'Получить список пользователей, доступных для добавления',
            description: [
                'Возвращает членов команды, которых еще нет в проекте.',
                'Полезно для поиска при добавлении новых участников.',
                'Поддерживает поиск по email и имени.',
                'Требуется роль owner или admin.',
            ].join('\n\n'),
        }),
        ApiParam({
            name: 'slug',
            description: 'Slug проекта',
            type: 'string',
            example: 'my-project',
        }),
        ApiQuery({
            name: 'search',
            description: 'Поиск по email или имени пользователя',
            type: 'string',
            required: false,
            example: 'ivan',
        }),
        ApiResponse({
            status: 200,
            description: 'Список доступных пользователей',
            type: class B {},
            // type: AvailableUsersResponse.Output,
        }),
        ApiNotFound('Проект не найден'),
        ApiForbidden('Недостаточно прав (требуется owner или admin)'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, null),
    );

export const AddMemberSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Добавить участника в проект',
            description: [
                'Добавляет пользователя из команды в проект с указанной ролью.',
                'Нельзя добавить пользователя, который уже является участником.',
                'Нельзя назначить роль owner через этот метод.',
                'Требуется роль owner или admin.',
            ].join('\n\n'),
        }),
        ApiParam({
            name: 'slug',
            description: 'Slug проекта',
            type: 'string',
            example: 'my-project',
        }),
        ApiBody({
            type: AddProjectMemberDto.Output,
            description: 'Данные для добавления участника',
        }),
        ApiResponse({
            status: 201,
            description: 'Участник успешно добавлен',
            type: ActionResponse.Output,
        }),
        ApiValidationError('Некорректные данные (несуществующий userId или роль)'),
        ApiNotFound('Проект не найден'),
        ApiForbidden('Недостаточно прав (требуется owner или admin)'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const UpdateMemberSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Изменить роль участника',
            description: [
                'Изменяет роль существующего участника проекта.',
                'Нельзя изменить роль владельца (owner).',
                'Нельзя назначить роль owner через этот метод.',
                'Требуется роль owner или admin.',
            ].join('\n\n'),
        }),
        ApiParam({
            name: 'slug',
            description: 'Slug проекта',
            type: 'string',
            example: 'my-project',
        }),
        ApiParam({
            name: 'memberId',
            description: 'ID записи участника (не userId!)',
            type: 'string',
            example: 'clv123456',
        }),
        ApiBody({
            type: UpdateProjectMemberDto.Output,
            description: 'Новая роль участника',
        }),
        ApiResponse({
            status: 200,
            description: 'Роль успешно обновлена',
            type: ActionResponse.Output,
        }),
        ApiValidationError('Некорректная роль'),
        ApiNotFound('Участник не найден в проекте'),
        ApiForbidden('Недостаточно прав или попытка изменить владельца'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );

export const RemoveMemberSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Удалить участника из проекта',
            description: [
                'Удаляет участника из проекта.',
                'Нельзя удалить владельца (owner).',
                'Участник может удалить себя сам (покинуть проект), даже если у него нет роли admin.',
                'Требуется роль owner/admin, либо это действие над собой.',
            ].join('\n\n'),
        }),
        ApiParam({
            name: 'slug',
            description: 'Slug проекта',
            type: 'string',
            example: 'my-project',
        }),
        ApiParam({
            name: 'memberId',
            description: 'ID записи участника (не userId!)',
            type: 'string',
            example: 'clv123456',
        }),
        ApiResponse({
            status: 200,
            description: 'Участник удален из проекта',
            type: ActionResponse.Output,
        }),
        ApiNotFound('Участник не найден в проекте'),
        ApiForbidden('Недостаточно прав или попытка удалить владельца'),
        ApiUnauthorized(),

        SetMetadata(ZOD_RESPONSE_TOKEN, ActionResponse),
    );
