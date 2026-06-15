import { Controller, Get, Res } from '@nestjs/common';
import * as client from 'prom-client';
import { FastifyReply } from 'fastify';
import { SkipContract } from '@shared/decorators';

@Controller('metrics')
export class MetricsController {
    @Get()
    @SkipContract()
    async getMetrics(@Res() reply: FastifyReply) {
        const metrics = await client.register.metrics();
        reply.type(client.register.contentType).send(metrics);
    }
}
