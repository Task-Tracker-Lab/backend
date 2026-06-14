import { Controller, Get, Res } from '@nestjs/common';
import * as client from 'prom-client';
import { FastifyReply } from 'fastify';
import { SkipContractHandle } from '@shared/decorators';

@Controller('metrics')
export class MetricsController {
    @Get()
    @SkipContractHandle()
    async getMetrics(@Res() reply: FastifyReply) {
        const metrics = await client.register.metrics();
        reply.type(client.register.contentType).send(metrics);
    }
}
