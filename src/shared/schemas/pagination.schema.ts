import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

const LimitSchema = z.coerce
    .number()
    .int()
    .min(1, 'Лимит должен быть не менее 1')
    .max(100, 'Лимит не может превышать 100')
    .optional()
    .default(20)
    .describe('Количество записей на странице');

export const OffsetQueryBaseSchema = z.object({
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
    limit: LimitSchema,
});

export const OffsetQuerySchema = OffsetQueryBaseSchema.transform((data) => {
    if (data.page > 1 && data.offset === 0) {
        return {
            ...data,
            offset: (data.page - 1) * (data.limit || 20),
        };
    }
    return data;
});

export const OffsetMetaSchema = z.object({
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

export const createOffsetResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
    z.object({ items: z.array(item), meta: OffsetMetaSchema });

export class OffsetQuery extends createZodDto(OffsetQuerySchema) {}

export const CursorQuerySchema = z.object({
    cursor: z
        .string()
        .optional()
        .describe('Курсор последнего элемента предыдущей страницы (base64url)'),
    limit: LimitSchema,
});

export const CursorMetaSchema = z.object({
    next: z.string().nullable().describe('Курсор следующей страницы'),
    hasNext: z.boolean().describe('Есть ли следующая страница'),
    limit: z.number().int().positive().describe('Количество элементов на одну страницу.'),
});

export const createCursorResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
    z.object({ items: z.array(item), meta: CursorMetaSchema });

export class CursorQuery extends createZodDto(CursorQuerySchema) {}

export const PaginationModeSchema = z.discriminatedUnion('mode', [
    z.object({
        mode: z.literal('offset'),
        page: z.coerce.number().int().positive().optional().default(1),
        offset: z.coerce.number().int().min(0).optional().default(0),
        limit: LimitSchema,
    }),
    z.object({
        mode: z.literal('cursor'),
        cursor: z.string().optional(),
        limit: LimitSchema,
    }),
]);

export const PaginationQuerySchema = z.discriminatedUnion('type', [
    OffsetQuerySchema,
    CursorQuerySchema,
]);

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
