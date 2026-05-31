import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';

@Module({
    imports: [
        PrometheusModule.register({
            controller: MetricsController,
            defaultMetrics: {
                enabled: process.env.NODE_ENV !== 'test',
            },
        }),
    ],
})
export class MetricsModule {}
