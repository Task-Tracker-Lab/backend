import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';

@Module({
    imports: [
        PrometheusModule.registerAsync({
            useFactory: () => ({
                defaultMetrics: {
                    enabled: process.env.NODE_ENV !== 'test',
                },
            }),
        }),
    ],
    controllers: [MetricsController],
})
export class MetricsModule {}
