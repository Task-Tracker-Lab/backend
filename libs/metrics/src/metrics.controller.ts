import { Controller, Get, Header } from '@nestjs/common';
import { SkipResponseValidation } from '@shared/decorators';
import * as client from 'prom-client';

@Controller('metrics')
export class MetricsController {
    @Get('system')
    @Header('Content-Type', client.register.contentType)
    @SkipResponseValidation()
    async getMetrics() {
        return client.register.metrics();
    }

    /** TODO: добавить, чтоб тут была сборка http запросов
     * почитай, как сделать правильно, там есть метка le
     * образно, /v1/users/me 10ms le=29
     * То есть это системная метрика, где контекст для приложения

     * Как седалешь удалить этот комментарий!
     */
    @Get()
    @Header('Content-Type', client.register.contentType)
    @SkipResponseValidation()
    async getHttp() {}
}
