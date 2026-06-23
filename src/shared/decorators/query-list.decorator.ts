import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export interface SortableFields {
    fields: string[];
    defaultField?: string;
    defaultOrder?: 'asc' | 'desc';
}

export interface ListQueryOptions {
    sortableFields: string[];
    defaultSortField?: string;
    defaultSortOrder?: 'asc' | 'desc';
    withSearch?: boolean;
    withDateRange?: boolean;
}

export const ApiPagination = () =>
    applyDecorators(
        ApiQuery({
            name: 'page',
            required: false,
            type: Number,
            description: 'Номер страницы (начиная с 1)',
            example: 1,
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            type: Number,
            description: 'Количество записей на странице (макс. 100)',
            example: 20,
        }),
        ApiQuery({
            name: 'offset',
            required: false,
            type: Number,
            description: 'Смещение для пагинации (альтернатива page)',
            example: 0,
        }),
    );

export const ApiCursorPagination = () =>
    applyDecorators(
        ApiQuery({
            name: 'cursor',
            required: false,
            type: String,
            description:
                'Курсор последнего элемента предыдущей страницы (base64url). Если не указан — первая страница.',
            example: 'eyJpZCI6NDJ9',
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            type: Number,
            description: 'Количество записей на странице (макс. 100)',
            example: 20,
        }),
    );

export const ApiSorting = (options: SortableFields) =>
    applyDecorators(
        ApiQuery({
            name: 'sortBy',
            required: false,
            enum: options.fields,
            description: `Поле для сортировки. Доступные поля: ${options.fields.join(', ')}`,
            example: options.defaultField || options.fields[0],
        }),
        ApiQuery({
            name: 'sortOrder',
            required: false,
            enum: ['asc', 'desc'],
            description: 'Направление сортировки',
            example: options.defaultOrder || 'asc',
        }),
    );

export const ApiDateRangeFilter = () =>
    applyDecorators(
        ApiQuery({
            name: 'fromDate',
            required: false,
            type: String,
            description: 'Начальная дата (ISO 8601)',
            example: '2024-01-01T00:00:00Z',
        }),
        ApiQuery({
            name: 'toDate',
            required: false,
            type: String,
            description: 'Конечная дата (ISO 8601)',
            example: '2024-12-31T23:59:59Z',
        }),
    );

export const ApiSearchFilter = () =>
    applyDecorators(
        ApiQuery({
            name: 'search',
            required: false,
            type: String,
            description: 'Поиск по тексту',
            example: 'keyword',
        }),
    );

export const ApiListQuery = (options: ListQueryOptions) => {
    const decorators = [
        ApiPagination(),
        ApiSorting({
            fields: options.sortableFields,
            defaultField: options.defaultSortField,
            defaultOrder: options.defaultSortOrder,
        }),
    ];

    if (options.withSearch) {
        decorators.push(ApiSearchFilter());
    }

    if (options.withDateRange) {
        decorators.push(ApiDateRangeFilter());
    }

    return applyDecorators(...decorators);
};
