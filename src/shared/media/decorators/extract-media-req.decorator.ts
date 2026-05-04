import { createParamDecorator, type ExecutionContext, HttpStatus } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { IMAGE_MIME_TYPES } from '../../constants';
import { BaseException } from '@shared/error';

export const ExtractMediaReq = createParamDecorator(
    async (
        data: { allowedMimetypes?: string[] } = { allowedMimetypes: IMAGE_MIME_TYPES },
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

        if (data?.allowedMimetypes && !data.allowedMimetypes.includes(file.mimetype)) {
            throw new BaseException(
                {
                    code: 'INVALID_FILE_TYPE',
                    message: 'Недопустимый формат файла',
                    details: [
                        {
                            target: 'mimetype',
                            received: file.mimetype,
                            expected: data.allowedMimetypes,
                        },
                    ],
                },
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
            );
        }

        const fields = Object.fromEntries(
            Object.entries(file.fields)
                .filter(([key, part]) => key !== 'file' && part && 'value' in part)
                // TODO: FIX
                .map(([key, part]) => [key, (part as any).value]),
        );

        return {
            ...fields,
            file: {
                buffer: await file.toBuffer(),
                filename: file.filename,
                mimetype: file.mimetype,
            },
        };
    },
);
