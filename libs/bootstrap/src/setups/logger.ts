import {
    Injectable,
    NestInterceptor,
    type ExecutionContext,
    type CallHandler,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule, utilities } from 'nest-winston';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { format, transports } from 'winston';

import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { FastifyRequest } from 'fastify';

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

    intercept(context: ExecutionContext, next: CallHandler) {
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

    private sanitize<T>(data: T): T {
        if (!data || typeof data !== 'object') {
            return data;
        }
        if (Array.isArray(data)) {
            return data.map((v) => this.sanitize(v)) as T;
        }

        const cleanData = structuredClone(data) as Record<string, unknown>;

        return Object.keys(cleanData).reduce<Record<string, unknown>>((acc, key) => {
            const isSensitive = this.sensitiveFields.some((field) =>
                key.toLowerCase().includes(field),
            );

            if (isSensitive) {
                acc[key] = '***';
            } else if (typeof cleanData[key] === 'object' && cleanData[key] !== null) {
                acc[key] = this.sanitize(cleanData[key]);
            } else {
                acc[key] = cleanData[key];
            }
            return acc;
        }, {}) as T;
    }
}

/**
 * Represents a structured application log payload for Grafana Loki.
 * This object is flattened to ensure each property is indexed as a top-level label/column.
 *
 * @typedef {object} TLog
 */
export type TLog = {
    /**
     * The severity level of the log.
     * Used by Grafana to color-code rows and for alerting.
     * @type {'info' | 'error' | 'warn'}
     */
    readonly level: 'info' | 'error' | 'warn';
    /**
     * Human-readable summary of the event.
     * @example 'Request completed POST /v1/auth/sign-in | 200 | 145ms'
     * @type {string}
     */
    readonly message: string;
    /**
     * Event occurrence time in ISO 8601 format.
     * @example '2026-05-09T01:17:29.000Z'
     * @type {string}
     */
    readonly timestamp: string;
    /**
     * Unique identifier for the HTTP request (e.g., UUID, NanoID).
     * Used to correlate all logs produced within a single request lifecycle.
     * @type {string}
     */
    readonly request_id: string;
    /**
     * The system component that triggered the log entry.
     * @type {'interceptor' | 'filter_exception' | 'guard' | 'service'}
     */
    readonly triggered_by: 'interceptor' | 'filter_exception' | 'guard' | 'service';
    /**
     * The logical type of the event within the request/response flow.
     * @type {'request' | 'response' | 'error' | 'system'}
     */
    readonly type: 'request' | 'response' | 'error' | 'system';
    /**
     * The HTTP method used for the request.
     * @type {'POST' | 'GET' | 'DELETE' | 'PATCH' | 'PUT' | 'OPTIONS' | 'HEAD'}
     */
    readonly method: 'POST' | 'GET' | 'DELETE' | 'PATCH' | 'PUT' | 'OPTIONS' | 'HEAD';
    /**
     * The full URL of the request, including query parameters.
     * @example '/v1/auth/sign-in?source=mobile'
     * @type {string}
     */
    readonly url: string;
    /**
     * The sanitized API path, including versioning but excluding query parameters.
     * Ideal for aggregating statistics per endpoint.
     * @example '/v1/auth/sign-in'
     * @type {string}
     */
    readonly path: string;
    /**
     * The HTTP status code returned to the client.
     * @example 200
     * @type {number}
     */
    readonly status_code: number;
    /**
     * Request processing time in milliseconds.
     * Note: Typically undefined for entries with type 'request'.
     * @type {number}
     */
    readonly delay_num?: number;
    /**
     * The client's IP address.
     * @type {string}
     */
    readonly ip: string;
    /**
     * The client's application or browser identification string.
     * @type {string}
     */
    readonly user_agent: string;
    /**
     * The name of the NestJS controller handling the request.
     * @example 'AuthController'
     * @type {string}
     */
    readonly controller: string;
    /**
     * The name of the specific controller method (handler).
     * @example 'signIn'
     * @type {string}
     */
    readonly handler: string;
    /**
     * The error stack trace. Only populated when level is 'error'.
     * @type {string}
     */
    readonly stack?: string;
    /**
     * Additional contextual data for debugging (e.g., Zod validation issues, DB error details).
     * @type {any}
     */
    readonly error_details?: any;
};
