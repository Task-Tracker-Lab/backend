import { createParamDecorator, type ExecutionContext, HttpStatus } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { formatBytes } from '@shared/utils/format-bytes.util';

import { IMAGE_MIME_TYPES } from '../../constants';

import type { FastifyRequest } from 'fastify';

export const ExtractMediaReq = createParamDecorator(
    async (
        {
            allowedMimetypes = IMAGE_MIME_TYPES,
        }: { readonly allowedMimetypes?: readonly string[] } = {},
        ctx: ExecutionContext,
    ) => {
        const maxFileSize = 5 * 1024 * 1024;
        const req = ctx.switchToHttp().getRequest<FastifyRequest>();

        if (!req.isMultipart()) {
            throw new BaseException(
                {
                    code: 'INVALID_CONTENT_TYPE',
                    message: 'Ожидался multipart/form-data запрос',
                    details: [
                        { target: 'header', message: 'Content-Type must be multipart/form-data' },
                    ],
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        try {
            const file = await req.file();
            if (!file) {
                throw new BaseException(
                    {
                        code: 'FILE_NOT_FOUND',
                        message: 'Файл не был передан в запросе',
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            const buffer = await file.toBuffer();

            if (allowedMimetypes?.length && !allowedMimetypes.includes(file.mimetype)) {
                throw new BaseException(
                    { code: 'INVALID_FILE_TYPE', message: 'Недопустимый формат файла' },
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                );
            }

            const fields: Record<string, string> = {};

            for (const key of Object.keys(file.fields)) {
                if (key === 'file') {
                    continue;
                }

                const field = file.fields[key];
                if (field && !Array.isArray(field) && 'value' in field) {
                    fields[key] = String(field.value);
                }
            }

            return {
                file: {
                    filename: file.filename,
                    mimetype: file.mimetype,
                    buffer,
                },
                ...fields,
            };
        } catch (e) {
            const hasCode = (err: unknown): err is { readonly code: string } =>
                err !== null && typeof err === 'object' && 'code' in err;

            if (hasCode(e) && e?.code === 'FST_REQ_FILE_TOO_LARGE') {
                throw new BaseException(
                    {
                        code: 'FILE_TOO_LARGE',
                        message: `Размер файла слишком большой. Максимальный размер: ${formatBytes(maxFileSize)}`,
                        details: [
                            {
                                target: 'file',
                                message: `Размер файла превышает лимит в ${formatBytes(maxFileSize)}`,
                            },
                        ],
                    },
                    HttpStatus.PAYLOAD_TOO_LARGE,
                );
            }

            throw e;
        }
    },
);
