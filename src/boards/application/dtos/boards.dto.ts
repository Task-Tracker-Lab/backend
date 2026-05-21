import { z } from 'zod/v4';
import { createZodDto } from 'nestjs-zod';
import { boardTypeEnum, columnStatusEnum } from '@core/boards/infrastructure/persistence/models';
import { ActionResponseSchema } from '@shared/dtos';
import { createPaginationSchema } from '@shared/schemas';

export const CreateBoardSchema = z.object({
    name: z
        .string()
        .min(1, 'Название доски не может быть пустым')
        .max(100, 'Название доски не должно превышать 100 символов'),
    position: z.number().finite().optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
});

export class CreateBoardDto extends createZodDto(CreateBoardSchema) {}

const CreateBoardResponseSchema = ActionResponseSchema.extend({
    boardId: z.string().describe('ID созданной доски'),
});

export class CreateBoardResponse extends createZodDto(CreateBoardResponseSchema) {}

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

const CreateBoardColumnResponseSchema = ActionResponseSchema.extend({
    columnId: z.string().describe('ID созданной колонки'),
});

export class CreateBoardColumnResponse extends createZodDto(CreateBoardColumnResponseSchema) {}

export const UpdateBoardColumnSchema = CreateBoardColumnSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
        error: 'Необходимо передать хотя бы одно поле для обновления',
        abort: true,
    },
);

export class UpdateBoardColumnDto extends createZodDto(UpdateBoardColumnSchema) {}

export const CreateBoardViewSchema = z.object({
    type: z.enum(boardTypeEnum.enumValues),
    name: z
        .string()
        .min(1, 'Название представления не может быть пустым')
        .max(100, 'Название представления не должно превышать 100 символов'),
    settings: z.record(z.string(), z.unknown()).optional(),
    position: z.number().finite(),
});

export class CreateBoardViewDto extends createZodDto(CreateBoardViewSchema) {}

const CreateBoardViewResponseSchema = ActionResponseSchema.extend({
    viewId: z.string().describe('ID созданного представления'),
});

export class CreateBoardViewResponse extends createZodDto(CreateBoardViewResponseSchema) {}

export const UpdateBoardViewSchema = CreateBoardViewSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
        error: 'Необходимо передать хотя бы одно поле для обновления',
        abort: true,
    },
);

export class UpdateBoardViewDto extends createZodDto(UpdateBoardViewSchema) {}

export const BoardColumnResponseSchema = z.object({
    id: z.string().describe('ID колонки'),
    boardId: z.string().describe('ID доски'),
    name: z.string().describe('Название колонки'),
    position: z.number().describe('Позиция колонки'),
    status: z.enum(columnStatusEnum.enumValues),
    color: z.string().describe('Цвет колонки в HEX'),
    createdAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата создания'),
    updatedAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата обновления'),
});

export class BoardColumnResponse extends createZodDto(BoardColumnResponseSchema) {}

export const BoardViewResponseSchema = z.object({
    id: z.string().describe('ID представления'),
    boardId: z.string().describe('ID доски'),
    type: z.enum(boardTypeEnum.enumValues).describe('Тип представления'),
    name: z.string().describe('Название представления'),
    settings: z.record(z.string(), z.unknown()).describe('Настройки представления'),
    position: z.number().describe('Позиция представления'),
    createdAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата создания'),
    updatedAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата обновления'),
});

export class BoardViewResponse extends createZodDto(BoardViewResponseSchema) {}

export const BoardResponseSchema = z.object({
    id: z.string().describe('ID доски'),
    name: z.string().describe('Название доски'),
    projectId: z.string().describe('ID проекта'),
    settings: z.record(z.string(), z.unknown()).describe('Настройки доски'),
    position: z.number().describe('Позиция доски'),
    ownerId: z.string().nullable().describe('ID владельца доски'),
    createdAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата создания'),
    updatedAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата обновления'),
    boardColumns: z.array(BoardColumnResponseSchema).describe('Колонки доски'),
    boardViews: z.array(BoardViewResponseSchema).describe('Представления доски'),
});

export class BoardResponse extends createZodDto(BoardResponseSchema) {}

export class BoardColumnsResponse extends createZodDto(
    createPaginationSchema(BoardColumnResponseSchema),
) {}

export class BoardViewsResponse extends createZodDto(
    createPaginationSchema(BoardViewResponseSchema),
) {}

export class BoardListResponse extends createZodDto(createPaginationSchema(BoardResponseSchema)) {}
