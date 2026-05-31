import { ApiBaseController, GetUserId } from '@shared/decorators';
import { BoardsFacade } from '@core/boards/application/boards.facade';
import { Body, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateBoardDto, UpdateBoardDto } from '@core/boards/application/dtos';
import {
    CreateBoardSwagger,
    FindAllBoardsSwagger,
    FindOneBoardSwagger,
    RemoveBoardSwagger,
    UpdateBoardSwagger,
} from './swagger';

@ApiBaseController('projects/:projectId/boards', 'Boards', true)
export class BoardsController {
    constructor(private readonly facade: BoardsFacade) {}

    @Get()
    @FindAllBoardsSwagger()
    async findAll(@Param('projectId') projectId: string, @GetUserId() userId: string) {
        return this.facade.getAll(projectId, userId);
    }

    @Get(':id')
    @FindOneBoardSwagger()
    async findOne(
        @Param('id') id: string,
        @Param('projectId') projectId: string,
        @GetUserId() userId: string,
    ) {
        return this.facade.getOne(id, projectId, userId);
    }

    @Post()
    @CreateBoardSwagger()
    async create(
        @Param('projectId') projectId: string,
        @GetUserId() userId: string,
        @Body() dto: CreateBoardDto,
    ) {
        return this.facade.create(projectId, userId, dto);
    }

    @Patch(':id')
    @UpdateBoardSwagger()
    async update(
        @Param('id') id: string,
        @Param('projectId') projectId: string,
        @GetUserId() userId: string,
        @Body() dto: UpdateBoardDto,
    ) {
        return this.facade.update(id, projectId, userId, dto);
    }

    @Delete(':id')
    @RemoveBoardSwagger()
    async remove(
        @Param('id') id: string,
        @Param('projectId') projectId: string,
        @GetUserId() userId: string,
    ) {
        return this.facade.delete(id, projectId, userId);
    }
}
