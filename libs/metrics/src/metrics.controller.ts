import { Controller, Get, Res } from '@nestjs/common';
import { SkipResponseValidation } from '@shared/decorators';
import * as client from 'prom-client';
import { FastifyReply } from 'fastify';

@Controller('metrics')
export class MetricsController {
    @Get()
    @SkipResponseValidation()
    async getMetrics(@Res() reply: FastifyReply) {
        const metrics = await client.register.metrics();
        reply.type(client.register.contentType).send(metrics);
    }
}
