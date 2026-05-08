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
import { format, transports } from 'winston';

export function setupLogger(service: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    return WinstonModule.createLogger({
        level: isProduction ? 'info' : 'debug',
        transports: [
            new transports.Console({
                format: format.combine(
                    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    format.ms(),
                    format.errors({ stack: true }),
                    format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'context'] }),
                    format((info) => {
                        const mask = (obj: any) => {
                            const sensitive = ['password', 'token', 'secret', 'authorization'];
                            for (const key in obj) {
                                if (sensitive.includes(key.toLowerCase())) obj[key] = '***';
                                else if (typeof obj[key] === 'object') mask(obj[key]);
                            }
                        };
                        if (info.metadata) mask(info.metadata);
                        return info;
                    })(),

                    isProduction
                        ? format.json()
                        : utilities.format.nestLike(service, {
                              colors: true,
                              prettyPrint: false,
                          }),
                ),
            }),
        ],
    });
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

        const sanitizedBody = this.sanitize(body);
        const queryPart = Object.keys(query).length ? `| Query: ${JSON.stringify(query)} ` : '';
        const bodyPart =
            sanitizedBody && Object.keys(sanitizedBody).length
                ? `| Body: ${JSON.stringify(sanitizedBody)} `
                : '';

        this.logger.log(
            `[${method}][${requestId}] ${url} ${queryPart}${bodyPart}| IP: ${ip} | UA: ${userAgent}`,
        );

        return next.handle().pipe(
            tap(() => {
                const delay = Date.now() - startTime;

                this.logger.log(`[${method}][${requestId}] ${url} | Success | ${delay}ms`);
            }),
            catchError((err) => {
                const delay = Date.now() - startTime;
                const statusCode = err.status || err.statusCode || 500;

                this.logger.error(
                    `[${method}][${requestId}] ${url} | Status: ${statusCode} | ${delay}ms | Msg: ${err.message}`,
                    err.stack,
                );

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
