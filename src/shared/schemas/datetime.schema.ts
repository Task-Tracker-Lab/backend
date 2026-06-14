import { z } from 'zod/v4';

export const DateRangeFilterSchema = z
    .object({
        fromDate: z
            .string()
            .datetime({ offset: true })
            .optional()
            .describe('Начальная дата (ISO 8601)'),

        toDate: z
            .string()
            .datetime({ offset: true })
            .optional()
            .describe('Конечная дата (ISO 8601)'),
    })
    .refine(
        (data) => {
            if (data.fromDate && data.toDate) {
                return new Date(data.fromDate) <= new Date(data.toDate);
            }
            return true;
        },
        {
            message: 'Дата начала не может быть позже даты окончания',
            path: ['fromDate'],
        },
    );
