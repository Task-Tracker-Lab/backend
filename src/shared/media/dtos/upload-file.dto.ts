import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';
import { ActionResponseSchema } from '@shared/dtos';

// const FileSchema = z.file().describe('Объект загруженного файла');

const FileSchema = z
    .object({
        buffer: z.any().describe('Бинарные данные файла'),
        filename: z
            .string()
            .regex(/\.(jpg|jpeg|png|webp)$/i, 'Допустимы только изображения')
            .describe('Имя файла с расширением'),
        mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp']).describe('MIME-тип файла'),
    })
    .describe('Объект загруженного файла');

export const UploadMediaSchema = z.object({
    context: z
        .enum(['user.avatar', 'team.avatar', 'team.banner'], {
            error: 'Выберите корректный контекст: user.avatar, team.avatar или team.banner',
        })
        .describe('Контекст загрузки (тип сущности и тип медиа)'),
    file: FileSchema,
    slug: z
        .string({
            error: 'Slug должен быть строкой',
        })
        .min(1, 'Slug не может быть пустым')
        .optional()
        .describe('Уникальный идентификатор (slug) команды. Обязателен для контекстов team.*'),
});

export const UploadMediaResponseSchema = ActionResponseSchema.extend({
    url: z.string().describe('URL загруженного файла'),
});

export class UploadMediaDto extends createZodDto(UploadMediaSchema) {}
export class UploadMediaResponse extends createZodDto(UploadMediaResponseSchema) {}
