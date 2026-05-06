import { createParamDecorator, type ExecutionContext, HttpStatus } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { IMAGE_MIME_TYPES } from '../../constants';
import { BaseException } from '@shared/error';

export const ExtractMediaReq = createParamDecorator(
    async (
        { allowedMimetypes = IMAGE_MIME_TYPES }: { allowedMimetypes?: string[] } = {},
        ctx: ExecutionContext,
    ) => {
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

        for (const key in file.fields) {
            if (key === 'file') continue;

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
    },
);
