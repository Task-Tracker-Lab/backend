import {
    type CallHandler,
    type ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Histogram } from 'prom-client';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import type { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
    constructor(
        @InjectMetric('http_request_duration_seconds')
        private readonly histogram: Histogram<string>,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<FastifyRequest>();
        const response = ctx.getResponse<FastifyReply>();

        const end = this.histogram.startTimer();

        return next.handle().pipe(
            tap(() => {
                this.recordMetrics(request, response, end);
            }),
            catchError((err) => {
                this.recordMetrics(request, response, end, err);
                return throwError(() => err);
            }),
        );
    }

    private recordMetrics(
        req: FastifyRequest,
        res: FastifyReply,
        end: (labels?: any) => number,
        err?: any,
    ) {
        const route = req.routeOptions?.url || req.url;

        if (route === '/metrics') {
            return;
        }

        const statusCode = err ? err.status || err.statusCode || 500 : res.statusCode;

        end({
            method: req.method,
            route,
            status: statusCode.toString(),
        });
    }
}
