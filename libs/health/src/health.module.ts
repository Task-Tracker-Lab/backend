import { Module } from '@nestjs/common';

import { HealthController } from './controller/health.controller';
import { ConfigurableModuleClass } from './health.module-definition';
import { HealthService } from './health.service';

@Module({
    controllers: [HealthController],
    providers: [HealthService],
    exports: [HealthService],
})
export class HealthModule extends ConfigurableModuleClass {}
