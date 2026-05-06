import { z } from 'zod/v4';
import { createZodDto } from 'nestjs-zod';

export const CreateBoardSchema = z.object({
    name: z
        .string()
        .min(1, 'Название доски не может быть пустым')
        .max(100, 'Название доски не должно превышать 100 символов'),
    position: z.number().finite().optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
});

export class CreateBoardDto extends createZodDto(CreateBoardSchema) {}

export const UpdateBoardSchema = CreateBoardSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
        error: 'Необходимо передать хотя бы одно поле для обновления',
        abort: true,
    },
);

export class UpdateBoardDto extends createZodDto(UpdateBoardSchema) {}
