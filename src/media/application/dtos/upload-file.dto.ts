import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

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
    teamId: z
        .string({
            error: 'Team ID должен быть строкой',
        })
        .min(1, 'Team ID не может быть пустым')
        .optional()
        .describe('Уникальный идентификатор команды. Обязателен для контекстов team.*'),
});

export class UploadMediaDto extends createZodDto(UploadMediaSchema) {}
