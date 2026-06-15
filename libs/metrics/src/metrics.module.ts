import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpMetricsInterceptor } from '@shared/interceptors';
import { makeHistogramProvider, PrometheusModule } from '@willsoto/nestjs-prometheus';

import { MetricsController } from './metrics.controller';

@Module({
    imports: [
        PrometheusModule.register({
            controller: MetricsController,
            defaultMetrics: {
                enabled: process.env['NODE_ENV'] !== 'test',
            },
        }),
    ],
    providers: [
        makeHistogramProvider({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status'],
            buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2.5, 5],
        }),
        {
            provide: APP_INTERCEPTOR,
            useClass: HttpMetricsInterceptor,
        },
    ],
})
export class MetricsModule {}
