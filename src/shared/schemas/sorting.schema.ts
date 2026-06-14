import { z } from 'zod/v4';

export const createSortingSchema = <T extends readonly [string, ...string[]]>(
    fields: T,
    defaultField?: T[number],
    defaultOrder: 'asc' | 'desc' = 'asc',
) => {
    return z.object({
        sortBy: z
            .enum(fields)
            .optional()
            /**
             * Приведение as any обусловлено ограничением системы типов TypeScript:
             * тип fields[0 выводится как string, а Zod ожидает конкретный литеральный тип
             * из объединения T[number]. В рантайме значение гарантированно валидно,
             * так как массив fields используется для создания enum.
             * as any безопасно подавляет ошибку, не расширяя тип за пределы этой строки.
             */
            .default(defaultField ?? (fields[0] as any))
            .describe(`Поле для сортировки. Доступно: ${fields.join(', ')}`),

        sortOrder: z
            .enum(['asc', 'desc'])
            .optional()
            .default(() => defaultOrder)
            .describe('Направление сортировки: asc - по возрастанию, desc - по убыванию'),
    });
};
