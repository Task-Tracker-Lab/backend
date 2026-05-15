import { Module } from '@nestjs/common';
import { HealthController } from './controller/health.controller';
import { HealthService } from './health.service';
import { ConfigurableModuleClass } from './health.module-definition';

@Module({
    controllers: [HealthController],
    providers: [HealthService],
    exports: [HealthService],
})
export class HealthModule extends ConfigurableModuleClass {}
