import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBaseController, GetUserId, Public } from '@shared/decorators';
import {
    CreateStateSwagger,
    FindAllStatesSwagger,
    FindOneStateSwagger,
    RemoveStateSwagger,
    ReorderStatesSwagger,
    RestoreStateSwagger,
    UpdateStateSwagger,
} from './swagger';
import { CreateStateDto, ReordersStatesDto, UpdateStateDto } from '../../dtos';
import { AreaFacade } from '../../area.facade';

@ApiBaseController('area/:slug/states', 'Area States', true)
export class StateController {
    constructor(private readonly facade: AreaFacade) {}

    @Get()
    @Public()
    @FindAllStatesSwagger()
    async getAll(
        @Param('slug') slug: string,
        @GetUserId() userId: string,
        @Query('hidden') hidden?: boolean,
        @Query('counts') counts?: boolean,
        @Query('my') my?: boolean,
        @Query('category') category?: string,
        @Query('overdue') overdue?: boolean,
    ) {
        const query = {
            hidden,
            counts,
            my,
            category,
            overdue,
        };

        return this.facade.getStates(slug, query, userId);
    }

    @Get(':stateId')
    @FindOneStateSwagger()
    async findOne(
        @Param('slug') slug: string,
        @Param('stateId') stateId: string,
        @GetUserId() userId: string,
    ) {
        return this.facade.getDetailState(slug, stateId, userId);
    }

    @Post()
    @CreateStateSwagger()
    async create(
        @Param('slug') slug: string,
        @Body() dto: CreateStateDto,
        @GetUserId() userId: string,
    ) {
        return this.facade.createState(slug, dto, userId);
    }

    @Delete(':stateId')
    @RemoveStateSwagger()
    async delete(
        @Param('slug') slug: string,
        @Param('stateId') stateId: string,
        @GetUserId() userId: string,
    ) {
        return this.facade.deleteState(slug, stateId, userId);
    }

    @Patch('reorder')
    @ReorderStatesSwagger()
    async reorder(
        @Param('slug') slug: string,
        @Body() dto: ReordersStatesDto,
        @GetUserId() userId: string,
    ) {
        return this.facade.reoderStates(slug, dto, userId);
    }

    @Patch(':stateId')
    @UpdateStateSwagger()
    async update(
        @Param('slug') slug: string,
        @Param('stateId') stateId: string,
        @Body() dto: UpdateStateDto,
        @GetUserId() userId: string,
    ) {
        return this.facade.updateState(slug, stateId, dto, userId);
    }

    @Post(':stateId/restore')
    @RestoreStateSwagger()
    async restore(
        @Param('slug') slug: string,
        @Param('stateId') stateId: string,
        @GetUserId() userId: string,
    ) {
        return this.facade.restoreState(slug, stateId, userId);
    }
}
