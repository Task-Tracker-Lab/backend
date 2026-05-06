import { z } from 'zod/v4';
import { createZodDto } from 'nestjs-zod';
import { boardTypeEnum } from '@core/boards/infrastructure/persistence/models/boards.model';

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

export const CreateBoardColumnSchema = z.object({
    name: z
        .string()
        .min(1, 'Название колонки не может быть пустым')
        .max(50, 'Название колонки не должно превышать 50 символов'),
    position: z.number().finite(),
    color: z
        .string()
        .regex(/^#[A-Fa-f0-9]{6}$/, 'Цвет должен быть в формате HEX (например, #FFFFFF)')
        .optional(),
});

export class CreateBoardColumnDto extends createZodDto(CreateBoardColumnSchema) {}

export const UpdateBoardColumnSchema = CreateBoardColumnSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
        error: 'Необходимо передать хотя бы одно поле для обновления',
        abort: true,
    },
);

export class UpdateBoardColumnDto extends createZodDto(UpdateBoardColumnSchema) {}

export const BoardColumnResponseSchema = z.object({
    id: z.string().describe('ID колонки'),
    boardId: z.string().describe('ID доски'),
    name: z.string().describe('Название колонки'),
    position: z.number().describe('Позиция колонки'),
    color: z.string().describe('Цвет колонки в HEX'),
    createdAt: z.string().datetime().describe('Дата создания'),
    updatedAt: z.string().datetime().describe('Дата обновления'),
});

export class BoardColumnResponse extends createZodDto(BoardColumnResponseSchema) {}

export const BoardViewResponseSchema = z.object({
    id: z.string().describe('ID представления'),
    boardId: z.string().describe('ID доски'),
    type: z.enum(boardTypeEnum.enumValues).describe('Тип представления'),
    name: z.string().describe('Название представления'),
    settings: z.record(z.string(), z.unknown()).describe('Настройки представления'),
    position: z.number().describe('Позиция представления'),
    createdAt: z.string().datetime().describe('Дата создания'),
    updatedAt: z.string().datetime().describe('Дата обновления'),
});

export class BoardViewResponse extends createZodDto(BoardViewResponseSchema) {}

export const BoardResponseSchema = z.object({
    id: z.string().describe('ID доски'),
    name: z.string().describe('Название доски'),
    projectId: z.string().describe('ID проекта'),
    settings: z.record(z.string(), z.unknown()).describe('Настройки доски'),
    position: z.number().describe('Позиция доски'),
    ownerId: z.string().nullable().describe('ID владельца доски'),
    createdAt: z.string().datetime().describe('Дата создания'),
    updatedAt: z.string().datetime().describe('Дата обновления'),
    boardColumns: z.array(BoardColumnResponseSchema).describe('Колонки доски'),
    boardViews: z.array(BoardViewResponseSchema).describe('Представления доски'),
});

export class BoardResponse extends createZodDto(BoardResponseSchema) {}
