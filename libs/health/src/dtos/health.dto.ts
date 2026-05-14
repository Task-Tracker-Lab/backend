import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

const HealthResponseSchema = z.object({
    service: z.string().describe('Название сервиса'),
    status: z.boolean().describe('Общий статус работоспособности (true — ок, false — есть сбои)'),
    components: z
        .record(z.string(), z.enum(['up', 'down']))
        .describe('Статусы отдельных компонентов (например, database, redis)'),
    info: z.object({
        version: z.string().describe('Версия приложения'),
        node: z.string().describe('Версия Node.js'),
    }),
    time: z.object({
        now: z.string().datetime().describe('Текущее время сервера (ISO)'),
        startedAt: z.string().datetime().describe('Время старта сервера (ISO)'),
        uptime: z.string().describe('Аптайм в читаемом формате (h m s)'),
        uptimeSeconds: z.number().describe('Аптайм в секундах'),
    }),
    loaded: z.string().describe('Средняя нагрузка на CPU за последнюю минуту (Load Average)'),
});

export class HealthResponse extends createZodDto(HealthResponseSchema) {}
