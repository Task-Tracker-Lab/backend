import { z } from 'zod/v4';

export const SearchFilterSchema = z.object({
    search: z
        .string()
        .trim()
        .min(1, 'Поисковый запрос не может быть пустым')
        .max(100, 'Поисковый запрос слишком длинный')
        .optional()
        .describe('Поиск по тексту'),
});
