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
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';

export function setupLogger(app: NestFastifyApplication, service: string) {
    const cfg = app.get(ConfigService);
    const isProduction = cfg.get('NODE_ENV') === 'production';

    const logger = WinstonModule.createLogger({
        level: isProduction ? 'info' : 'debug',
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
            format.errors({ stack: true }),
            isProduction
                ? format.json()
                : format.combine(format.ms(), utilities.format.nestLike(service, { colors: true })),
        ),
        transports: [new transports.Console()],
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
        const startTime = Date.now();

        const baseCtx = {
            request_id: request.id || request.headers['x-request-id'] || 'unknown',
            method: request.method,
            url: request.url,
            path: request.url.split('?')[0],
            controller: context.getClass().name,
            handler: context.getHandler().name,
            ip: request.ip,
            referer: request.headers['referer'] || 'direct',
            user_agent: request.headers['user-agent'] || 'unknown',
            triggered_by: 'interceptor',
        };

        this.logger.log(`Incoming ${baseCtx.method} ${baseCtx.url}`, {
            ...baseCtx,
            type: 'request',
            body: this.sanitize(request.body),
            query: request.query,
        });

        return next.handle().pipe(
            tap(() => {
                const delay_num = Date.now() - startTime;

                this.logger.log(`${baseCtx.method} ${baseCtx.path} | 200 | ${delay_num}ms`, {
                    ...baseCtx,
                    type: 'response',
                    status_code: 200,
                    delay_num,
                });
            }),
            catchError((err) => {
                const delay_num = Date.now() - startTime;
                const status_code = err.status || err.statusCode || 500;

                this.logger.error(
                    `${baseCtx.method} ${baseCtx.path} | ${status_code} | ${delay_num}ms`,
                    {
                        ...baseCtx,
                        type: 'error',
                        status_code,
                        delay_num,
                        stack: err.stack,
                        error_details: err.response || err.message,
                    },
                );

                return throwError(() => err);
            }),
        );
    }

    private sanitize<T>(data: T) {
        if (!data || typeof data !== 'object') return data;
        if (Array.isArray(data)) return data.map((v) => this.sanitize(v));

        const cleanData = JSON.parse(JSON.stringify(data));

        return Object.keys(cleanData).reduce((acc, key) => {
            const isSensitive = this.sensitiveFields.some((field) =>
                key.toLowerCase().includes(field),
            );

            if (isSensitive) {
                acc[key] = '***';
            } else if (typeof cleanData[key] === 'object') {
                acc[key] = this.sanitize(cleanData[key]);
            } else {
                acc[key] = cleanData[key];
            }
            return acc;
        }, {});
    }
}

/**
 * Represents a structured application log payload for Grafana Loki.
 * This object is flattened to ensure each property is indexed as a top-level label/column.
 *
 * @typedef {Object} TLog
 */
export type TLog = {
    /**
     * The severity level of the log.
     * Used by Grafana to color-code rows and for alerting.
     * @type {'info' | 'error' | 'warn'}
     */
    level: 'info' | 'error' | 'warn';
    /**
     * Human-readable summary of the event.
     * @example 'Request completed POST /v1/auth/sign-in | 200 | 145ms'
     * @type {string}
     */
    message: string;
    /**
     * Event occurrence time in ISO 8601 format.
     * @example '2026-05-09T01:17:29.000Z'
     * @type {string}
     */
    timestamp: string;
    /**
     * Unique identifier for the HTTP request (e.g., UUID, NanoID).
     * Used to correlate all logs produced within a single request lifecycle.
     * @type {string}
     */
    request_id: string;
    /**
     * The system component that triggered the log entry.
     * @type {'interceptor' | 'filter_exception' | 'guard' | 'service'}
     */
    triggered_by: 'interceptor' | 'filter_exception' | 'guard' | 'service';
    /**
     * The logical type of the event within the request/response flow.
     * @type {'request' | 'response' | 'error' | 'system'}
     */
    type: 'request' | 'response' | 'error' | 'system';
    /**
     * The HTTP method used for the request.
     * @type {'POST' | 'GET' | 'DELETE' | 'PATCH' | 'PUT' | 'OPTIONS' | 'HEAD'}
     */
    method: 'POST' | 'GET' | 'DELETE' | 'PATCH' | 'PUT' | 'OPTIONS' | 'HEAD';
    /**
     * The full URL of the request, including query parameters.
     * @example '/v1/auth/sign-in?source=mobile'
     * @type {string}
     */
    url: string;
    /**
     * The sanitized API path, including versioning but excluding query parameters.
     * Ideal for aggregating statistics per endpoint.
     * @example '/v1/auth/sign-in'
     * @type {string}
     */
    path: string;
    /**
     * The HTTP status code returned to the client.
     * @example 200
     * @type {number}
     */
    status_code: number;
    /**
     * Request processing time in milliseconds.
     * Note: Typically undefined for entries with type 'request'.
     * @type {number}
     */
    delay_num?: number;
    /**
     * The client's IP address.
     * @type {string}
     */
    ip: string;
    /**
     * The client's application or browser identification string.
     * @type {string}
     */
    user_agent: string;
    /**
     * The name of the NestJS controller handling the request.
     * @example 'AuthController'
     * @type {string}
     */
    controller: string;
    /**
     * The name of the specific controller method (handler).
     * @example 'signIn'
     * @type {string}
     */
    handler: string;
    /**
     * The error stack trace. Only populated when level is 'error'.
     * @type {string}
     */
    stack?: string;
    /**
     * Additional contextual data for debugging (e.g., Zod validation issues, DB error details).
     * @type {any}
     */
    error_details?: any;
};
