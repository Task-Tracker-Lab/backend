import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const PaginationBaseSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive('Страница должна быть положительным числом')
        .optional()
        .default(1)
        .describe('Номер страницы (начиная с 1)'),

    offset: z.coerce
        .number()
        .int()
        .min(0, 'Смещение не может быть отрицательным')
        .optional()
        .default(0)
        .describe('Смещение для пагинации (альтернатива page)'),

    limit: z.coerce
        .number()
        .int()
        .min(1, 'Лимит должен быть не менее 1')
        .max(100, 'Лимит не может превышать 100')
        .optional()
        .default(20)
        .describe('Количество записей на странице'),
});

export const PaginationSchema = PaginationBaseSchema.transform((data) => {
    if (data.page > 1 && data.offset === 0) {
        return {
            ...data,
            offset: (data.page - 1) * (data.limit || 20),
        };
    }
    return data;
});

export const paginationResponseSchema = z.object({
    hasNextPage: z
        .boolean()
        .describe('Флаг наличия следующей страницы. True, если текущая страница не последняя.'),
    hasPrevPage: z
        .boolean()
        .describe('Флаг наличия предыдущей страницы. True, если текущая страница больше первой.'),
    total: z
        .number()
        .int()
        .nonnegative()
        .describe('Общее количество записей, соответствующих поисковому запросу/фильтрам.'),
    totalPages: z
        .number()
        .int()
        .nonnegative()
        .describe('Общее количество страниц, рассчитанное на основе limit.'),
    page: z.number().int().positive().describe('Номер текущей страницы (начиная с 1).'),
    limit: z.number().int().positive().describe('Количество элементов на одну страницу.'),
});

export const createPaginationSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        items: z.array(itemSchema),
        meta: paginationResponseSchema,
    });

export class PaginationQuery extends createZodDto(PaginationSchema) {}
