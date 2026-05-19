import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthResponse, HealthDetailedResponse } from '../dtos';
import { ZOD_RESPONSE_TOKEN } from '@shared/interceptors';

export const GetHealthSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Краткий статус (Health Check)',
            description: 'Используется внешними системами для проверки доступности сервиса.',
        }),
        ApiResponse({
            status: 200,
            description: 'Сервис работает нормально',
            type: HealthResponse.Output,
        }),
        ApiResponse({ status: 503, description: 'Сервис недоступен или критическая ошибка' }),

        SetMetadata(ZOD_RESPONSE_TOKEN, HealthResponse),
    );

export const GetPingSwagger = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Детальный дамп состояния',
            description: 'Возвращает аптайм, время старта и метрики памяти.',
        }),
        ApiResponse({
            status: 200,
            description: 'Полная статистика сервиса',
            type: HealthDetailedResponse.Output,
        }),

        SetMetadata(ZOD_RESPONSE_TOKEN, HealthDetailedResponse),
    );
