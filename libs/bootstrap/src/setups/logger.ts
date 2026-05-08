import {
    Injectable,
    NestInterceptor,
    type ExecutionContext,
    type CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import type { FastifyRequest } from 'fastify';
import { WinstonModule, utilities } from 'nest-winston';
import { format, transport, transports } from 'winston';
import Loki from 'winston-loki';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';

export function setupLogger(app: NestFastifyApplication, service: string) {
    const cfg = app.get(ConfigService);

    const isProduction = cfg.get('NODE_ENV') === 'production';
    const loki = cfg.get('LOKI_HOST');

    const transportsList: transport[] = [
        new transports.Console({
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                format.ms(),
                format.errors({ stack: true }),

                isProduction
                    ? format.json()
                    : utilities.format.nestLike(service, {
                          colors: true,
                          prettyPrint: false,
                      }),
            ),
        }),
    ];

    if (loki) {
        transportsList.push(
            new Loki({
                host: loki,
                labels: { app: service },
                json: true,
                format: format.json(),
                replaceTimestamp: true,
                onConnectionError: (err) => console.error('Loki connection error:', err),
            }),
        );
    }

    const logger = WinstonModule.createLogger({
        level: isProduction ? 'info' : 'debug',
        transports: transportsList,
    });

    app.useLogger(logger);
    app.useGlobalInterceptors(new LoggingInterceptor());
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');
    private readonly sensitiveFields = ['password', 'token', 'access', 'refresh', 'code', 'secret'];

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const { method, url, body, query, ip, headers } = request;

        const requestId = request.id || request.headers['x-request-id'] || 'unknown';
        const userAgent = headers['user-agent'] || 'unknown';
        const startTime = Date.now();

        const controllerName = context.getClass().name;
        const handlerName = context.getHandler().name;

        const sanitizedBody = this.sanitize(body);
        const referer = headers['referer'] || 'direct';

        this.logger.log(`--> ${method} ${url}`, {
            context: 'HTTP',
            type: 'request_incoming',
            method,
            url,
            path: url.split('?')[0],
            requestId,
            controller: controllerName,
            handler: handlerName,
            ip,
            userAgent,
            referer,
            protocol: request.protocol,
            body: sanitizedBody,
            query: query,
        });

        return next.handle().pipe(
            tap(() => {
                const delay = Date.now() - startTime;

                this.logger.log(`<-- ${method} ${url} | 200 | ${delay}ms`, {
                    context: 'HTTP',
                    type: 'request_completed',
                    method,
                    url,
                    requestId,
                    controller: controllerName,
                    handler: handlerName,
                    ip,
                    delay_num: delay,
                    status: 'success',
                    statusCode: 200,
                });
            }),
            catchError((err) => {
                const delay = Date.now() - startTime;
                const statusCode = err.status || err.statusCode || 500;

                this.logger.error(`<-- ${method} ${url} | ${statusCode} | ${delay}ms`, {
                    context: 'HTTP',
                    type: 'request_error',
                    method,
                    url,
                    requestId,
                    controller: controllerName,
                    handler: handlerName,
                    ip,
                    statusCode,
                    delay_num: delay,
                    status: 'error',
                    errorMessage: err?.message,
                    errorStack: err?.stack,
                });

                return throwError(() => err);
            }),
        );
    }

    private sanitize(data: any): any {
        if (!data || typeof data !== 'object') return data;
        if (Array.isArray(data)) return data.map((v) => this.sanitize(v));

        return Object.keys(data).reduce((acc, key) => {
            const isSensitive = this.sensitiveFields.some((field) =>
                key.toLowerCase().includes(field),
            );

            if (isSensitive) {
                acc[key] = '***';
            } else if (typeof data[key] === 'object') {
                acc[key] = this.sanitize(data[key]);
            } else {
                acc[key] = data[key];
            }
            return acc;
        }, {});
    }
}
