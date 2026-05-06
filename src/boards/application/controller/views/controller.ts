import { Body, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';
import { BoardsFacade } from '@core/boards/application/boards.facade';
import { CreateBoardViewDto, UpdateBoardViewDto } from '@core/boards/application/dtos';
import type { BoardView } from '@core/boards/domain/entities';
import {
    CreateBoardViewSwagger,
    FindAllBoardViewsSwagger,
    FindOneBoardViewSwagger,
    RemoveBoardViewSwagger,
    UpdateBoardViewSwagger,
} from './swagger';

@ApiBaseController('boards/:boardId/views', 'Board Views', true)
export class ViewsController {
    constructor(private readonly facade: BoardsFacade) {}

    @Get()
    @FindAllBoardViewsSwagger()
    async findAll(
        @Param('boardId') boardId: string,
        @GetUserId() userId: string,
    ): Promise<BoardView[]> {
        return this.facade.getViews(boardId, userId);
    }

    @Get(':id')
    @FindOneBoardViewSwagger()
    async findOne(
        @Param('id') id: string,
        @Param('boardId') boardId: string,
        @GetUserId() userId: string,
    ): Promise<BoardView | null> {
        return this.facade.getView(id, boardId, userId);
    }

    @Post()
    @CreateBoardViewSwagger()
    async create(
        @Param('boardId') boardId: string,
        @GetUserId() userId: string,
        @Body() dto: CreateBoardViewDto,
    ): Promise<BoardView> {
        return this.facade.createView(boardId, userId, dto);
    }

    @Patch(':id')
    @UpdateBoardViewSwagger()
    async update(
        @Param('id') id: string,
        @Param('boardId') boardId: string,
        @GetUserId() userId: string,
        @Body() dto: UpdateBoardViewDto,
    ): Promise<BoardView | null> {
        return this.facade.updateView(id, boardId, userId, dto);
    }

    @Delete(':id')
    @RemoveBoardViewSwagger()
    async remove(
        @Param('id') id: string,
        @Param('boardId') boardId: string,
        @GetUserId() userId: string,
    ): Promise<boolean> {
        return this.facade.deleteView(id, boardId, userId);
    }
}
