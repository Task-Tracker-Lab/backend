import {
    type ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { DrizzleQueryError } from 'drizzle-orm';
import { ZodValidationException } from 'nestjs-zod';
import { PostgresError } from 'postgres';

import { BaseException, type IErrorOptions } from './exception';
import { DATABASE_ERRORS } from './swagger';

import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ZodError, ZodIssue } from 'zod/v4';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);
    private readonly isDev = process.env['NODE_ENV'] === 'development';

    catch(exception: unknown, host: ArgumentsHost) {
        if (exception instanceof ZodValidationException) {
            return this.parseZodValidation(exception, host);
        }

        if (exception instanceof BaseException) {
            return this.parseHttp(exception, host);
        }

        if (exception instanceof HttpException) {
            return this.parseNestHttp(exception, host);
        }

        if (exception instanceof DrizzleQueryError) {
            return this.parseDatabase(exception, host);
        }

        return this.handleUnknownError(exception, host);
    }

    private parseZodValidation = (exception: ZodValidationException, host: ArgumentsHost) => {
        const { request, response } = this.getCtxBase(host);
        const status = exception.getStatus();

        const zodError = exception.getZodError() as ZodError;
        const issues: ZodIssue[] = zodError.issues || [];

        this.log(exception, host, status, {
            validationIssues: issues,
            body: request.body,
        });

        return response.status(status).send(
            this.formatErrorResponse(request, status, {
                code: 'VALIDATION_FAILED',
                message: 'Переданные данные не прошли валидацию',
                details: issues,
                stack: exception.stack,
            }),
        );
    };

    private parseDatabase = (exception: DrizzleQueryError, host: ArgumentsHost) => {
        const { request, response } = this.getCtxBase(host);

        const error =
            exception.cause instanceof PostgresError
                ? exception.cause
                : exception instanceof PostgresError
                  ? exception
                  : null;

        let status = 500;
        let message = exception.message || 'Database operation failed';
        const errorCode = 'DATABASE_ERROR';

        if (error) {
            const mapping = DATABASE_ERRORS[error.code];
            if (mapping) {
                status = mapping.code;
                message = mapping.msg;
            }
        }

        this.log(exception, host, status, {
            dbCode: error?.code,
            dbTable: error?.table_name,
            dbDetail: error?.detail,
            query: this.isDev ? exception.query : undefined,
        });

        return response.status(status).send(
            this.formatErrorResponse(request, status, {
                code: errorCode,
                message,
                details: error?.detail ? [{ target: error.detail }] : [],
                stack: exception.stack,
                service: 'postgres',
            }),
        );
    };

    private parseHttp = (exception: BaseException, host: ArgumentsHost) => {
        const { request, response } = this.getCtxBase(host);
        const status = exception.getStatus();

        const error = exception.getResponse() as IErrorOptions;

        this.log(exception, host, status, {
            errorCode: error.code,
            details: error.details,
            type: 'BUSINESS_EXCEPTION',
        });

        return response.status(status).send(
            this.formatErrorResponse(request, status, {
                code: error.code,
                message: error.message || exception.message,
                details: error.details || [],
                stack: exception.stack,
            }),
        );
    };

    private parseNestHttp = (exception: HttpException, host: ArgumentsHost) => {
        const { request, response } = this.getCtxBase(host);
        const status = exception.getStatus();
        const res = exception.getResponse();

        const message =
            typeof res === 'object' && res !== null && 'message' in res
                ? String(res.message)
                : exception.message;

        const errorCode =
            typeof res === 'object' && res !== null && 'error' in res && res.error
                ? String(res.error)
                : null;
        const code = errorCode ? errorCode.toUpperCase().replace(/\s+/g, '_') : 'HTTP_EXCEPTION';

        this.log(exception, host, status, {
            httpCode: code,
            nestResponse: res,
            type: 'NEST_HTTP_EXCEPTION',
        });

        return response.status(status).send(
            this.formatErrorResponse(request, status, {
                code,
                message,
                stack: exception.stack,
                details: [],
            }),
        );
    };

    private handleUnknownError(exception: any, host: ArgumentsHost) {
        const { request, response } = this.getCtxBase(host);
        const status = HttpStatus.INTERNAL_SERVER_ERROR;

        this.log(exception, host, status, { type: 'UNKNOWN_SERVER_ERROR' });

        return response.status(status).send(
            this.formatErrorResponse(request, status, {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Произошла непредвиденная ошибка на сервере',
                details: [],
                stack: exception?.stack,
            }),
        );
    }

    private formatErrorResponse(
        request: FastifyRequest,
        status: number,
        data: {
            readonly code: string;
            readonly message: string;
            readonly details: readonly any[];
            readonly stack?: string;
            readonly service?: string;
        },
    ) {
        const requestId = request.id ?? request.headers['x-request-id'];

        return {
            success: false,
            error: {
                code: data.code,
                message: data.message,
                retryable: status >= 500,
            },
            details: data.details,
            meta: {
                service: data.service ?? 'gateway',
                request: {
                    requestId,
                    path: request.url,
                    method: request.method,
                    ip: request.ip,
                },
                timestamp: new Date().toISOString(),
                ...(this.isDev && {
                    debug: {
                        stack: data.stack,
                    },
                }),
            },
        };
    }

    private getCtxBase(host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        return {
            response: ctx.getResponse<FastifyReply>(),
            request: ctx.getRequest<FastifyRequest>(),
        };
    }

    private log(
        exception: any,
        host: ArgumentsHost,
        status: number,
        extraData: Record<string, unknown> = {},
    ) {
        const { request } = this.getCtxBase(host);

        const logData = {
            request_id: request.id || request.headers['x-request-id'] || 'unknown',
            triggered_by: 'filter_exception',
            type: 'error',
            method: request.method ?? 'Unknown',
            url: request.url,
            path: request.url.split('?')[0],
            status_code: status,
            ip: request.ip,
            user_agent: request.headers['user-agent'] || 'unknown',
            controller: 'Unknown',
            handler: 'Unknown',
            stack: exception instanceof Error ? exception.stack : undefined,
            error_details: extraData,
        };

        const message = `Exception Filter: ${logData.method} ${logData.path} | ${status} | ${exception?.message || 'Unknown Error'}`;

        if (status >= 500) {
            this.logger.error(message, logData);
        } else {
            this.logger.warn(message, logData);
        }
    }
}
