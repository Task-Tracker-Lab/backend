import { z } from 'zod/v4';
import { createZodDto } from 'nestjs-zod';

export const SessionResponseSchema = z
    .object({
        id: z.string().describe('ID сессии'),
        device: z.string().describe('Устройство/браузер'),
        ip: z.string().describe('IP адрес'),
        lastActive: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
                message: 'Строка не является валидной датой',
            })
            .describe('Дата последней активности (ISO 8601)'),
        isCurrent: z.boolean().describe('Флаг текущей сессии'),
    })
    .describe('Схема ответа одной сессии');

export class SessionResponse extends createZodDto(SessionResponseSchema) {}

export const SessionsResponseSchema = z
    .array(SessionResponseSchema)
    .describe('Список активных сессий');

export class SessionsResponse extends createZodDto(SessionsResponseSchema) {}
