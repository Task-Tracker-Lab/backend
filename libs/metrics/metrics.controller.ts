import { Controller, Get, Header } from '@nestjs/common';
import * as client from 'prom-client';
import { SkipResponseValidation } from '@shared/decorators';

@Controller()
export class MetricsController {
    @Get('dump')
    @Header('Content-Type', client.register.contentType)
    @SkipResponseValidation()
    async getMetrics() {
        return client.register.metrics();
    }
}
