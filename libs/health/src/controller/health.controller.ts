import { Controller, Get, HttpStatus } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { HealthService } from '../health.service';
import { GetHealthSwagger, GetPingSwagger } from './health.swagger';
import { ApiTags } from '@nestjs/swagger';
import { BaseException } from '@shared/error';

@SkipThrottle()
@Controller()
@ApiTags('System')
export class HealthController {
    constructor(private readonly service: HealthService) {}

    @Get('health')
    @GetHealthSwagger()
    async checkHealth() {
        const pingData = await this.service.getHealthData();

        if (!pingData.status) {
            throw new BaseException(
                {
                    code: 'SERVICE_UNHEALTHY',
                    message: `Сервис ${pingData.service} временно недоступен или работает некорректно`,
                    details: [
                        {
                            target: pingData.service,
                            status: pingData.status,
                            timestamp: new Date().toISOString(),
                        },
                    ],
                },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        return { status: 'healthy' };
    }

    @Get('ping')
    @GetPingSwagger()
    async ping() {
        return this.service.getHealthData();
    }
}
