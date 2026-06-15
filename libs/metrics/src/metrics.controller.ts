import { Controller, Get, Res } from '@nestjs/common';
import { SkipContract } from '@shared/decorators';
import { FastifyReply } from 'fastify';
import * as client from 'prom-client';

@Controller('metrics')
export class MetricsController {
    @Get()
    @SkipContract()
    async getMetrics(@Res() reply: FastifyReply) {
        const metrics = await client.register.metrics();
        reply.type(client.register.contentType).send(metrics);
    }
}
