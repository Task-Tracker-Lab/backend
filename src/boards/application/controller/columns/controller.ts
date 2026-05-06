import { ApiBaseController, GetUserId } from '@shared/decorators';
import { BoardsFacade } from '@core/boards/application/boards.facade';
import { Body, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateBoardColumnDto, UpdateBoardColumnDto } from '@core/boards/application/dtos';
import type { BoardColumn } from '@core/boards/domain/entities';
import {
    CreateBoardColumnSwagger,
    FindAllBoardColumnsSwagger,
    FindOneBoardColumnSwagger,
    RemoveBoardColumnSwagger,
    UpdateBoardColumnSwagger,
} from './swagger';

@ApiBaseController('boards/:boardId/columns', 'Board Columns', true)
export class ColumnsController {
    constructor(private readonly facade: BoardsFacade) {}

    @Get()
    @FindAllBoardColumnsSwagger()
    async findAll(
        @Param('boardId') boardId: string,
        @GetUserId() userId: string,
    ): Promise<BoardColumn[]> {
        return this.facade.getColumns(boardId, userId);
    }

    @Get(':id')
    @FindOneBoardColumnSwagger()
    async findOne(
        @Param('id') id: string,
        @Param('boardId') boardId: string,
        @GetUserId() userId: string,
    ): Promise<BoardColumn | null> {
        return this.facade.getColumn(id, boardId, userId);
    }

    @Post()
    @CreateBoardColumnSwagger()
    async create(
        @Param('boardId') boardId: string,
        @GetUserId() userId: string,
        @Body() dto: CreateBoardColumnDto,
    ): Promise<BoardColumn> {
        return this.facade.createColumn(boardId, userId, dto);
    }

    @Patch(':id')
    @UpdateBoardColumnSwagger()
    async update(
        @Param('id') id: string,
        @Param('boardId') boardId: string,
        @GetUserId() userId: string,
        @Body() dto: UpdateBoardColumnDto,
    ): Promise<BoardColumn | null> {
        return this.facade.updateColumn(id, boardId, userId, dto);
    }

    @Delete(':id')
    @RemoveBoardColumnSwagger()
    async remove(
        @Param('id') id: string,
        @Param('boardId') boardId: string,
        @GetUserId() userId: string,
    ): Promise<boolean> {
        return this.facade.deleteColumn(id, boardId, userId);
    }
}
