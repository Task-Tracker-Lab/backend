import {
    CallHandler,
    ExecutionContext,
    HttpStatus,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { BaseException } from '@shared/error';
import { z } from 'zod/v4';
import { SKIP_RESPONSE_VALIDATION_KEY } from '@shared/decorators/skip-response-validation.decorator';

export const ZOD_RESPONSE_TOKEN = 'ZOD_RESPONSE_TOKEN';

@Injectable()
export class ZodValidationInterceptor implements NestInterceptor<unknown, unknown> {
    constructor(private reflector: Reflector) {}

    intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
        const handler = context.getHandler();
        const controller = context.getClass();

        const isSkipped = this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_VALIDATION_KEY, [
            handler,
            controller,
        ]);

        if (isSkipped) {
            return next.handle();
        }

        const metadata = this.reflector.get<{ schema: z.ZodTypeAny } | undefined>(
            ZOD_RESPONSE_TOKEN,
            handler,
        );

        const schema = metadata ? metadata.schema : undefined;

        return next.handle().pipe(
            map((data) => {
                if (!schema) {
                    throw new BaseException(
                        {
                            code: 'MISSING_VALIDATION_SCHEMA',
                            message: 'Данные ответа не соответствуют ожидаемому формату',
                        },
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }

                const res = schema.safeParse(data);

                if (!res.success) {
                    throw new BaseException(
                        {
                            code: 'RESPONSE_VALIDATION_FAILED',
                            message: 'Данные ответа не соответствуют ожидаемому формату',
                            details: res.error.issues,
                        },
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }

                return res.data;
            }),
        );
    }
}
