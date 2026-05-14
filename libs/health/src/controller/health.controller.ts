import { Controller, Get, HttpStatus, Inject } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { HealthService } from '../health.service';
import { GetHealthSwagger, GetPingSwagger } from './health.swagger';
import { ApiTags } from '@nestjs/swagger';
import { BaseException } from '@shared/error';
import { MODULE_OPTIONS_TOKEN } from '../health.module-definition';
import { HealthModuleOptions } from '../interfaces';

@SkipThrottle()
@Controller()
@ApiTags('System')
export class HealthController {
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: HealthModuleOptions,
        private readonly service: HealthService,
    ) {}

    @Get('health')
    @GetHealthSwagger()
    async checkHealth() {
        const { serviceName } = this.options;
        const pingData = await this.service.getHealthData();

        if (!pingData.status) {
            throw new BaseException(
                {
                    code: 'SERVICE_UNHEALTHY',
                    message: `Сервис ${serviceName} временно недоступен или работает некорректно`,
                    details: [
                        {
                            target: serviceName,
                            status: pingData.status,
                            timestamp: new Date().toISOString(),
                        },
                    ],
                },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        return 'healthy';
    }

    @Get('ping')
    @GetPingSwagger()
    async ping() {
        return this.service.getHealthData();
    }
}
