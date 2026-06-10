import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBaseController, GetUserId, Public } from '@shared/decorators';
import {
    CreateProjectStateSwagger,
    FindAllProjectStatesSwagger,
    FindOneProjectStateSwagger,
    RemoveProjectStateSwagger,
    ReorderProjectStatesSwagger,
    RestoreProjectStateSwagger,
    UpdateProjectStateSwagger,
} from './swagger';
import { ProjectsFacade } from '../../projects.facade';
import { CreateProjectStateDto, ReorderProjectsStatesDto, UpdateProjectStateDto } from '../../dtos';

@ApiBaseController('projects/:slug/states', 'Project States', true)
export class ProjectsStatesController {
    constructor(private readonly facade: ProjectsFacade) {}

    @Get()
    @Public()
    @FindAllProjectStatesSwagger()
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
    @FindOneProjectStateSwagger()
    async findOne(
        @Param('slug') slug: string,
        @Param('stateId') stateId: string,
        @GetUserId() userId: string,
    ) {
        return this.facade.getDetailState(slug, stateId, userId);
    }

    @Post()
    @CreateProjectStateSwagger()
    async create(
        @Param('slug') slug: string,
        @Body() dto: CreateProjectStateDto,
        @GetUserId() userId: string,
    ) {
        return this.facade.createState(slug, dto, userId);
    }

    @Delete(':stateId')
    @RemoveProjectStateSwagger()
    async delete(
        @Param('slug') slug: string,
        @Param('stateId') stateId: string,
        @GetUserId() userId: string,
    ) {
        return this.facade.deleteState(slug, stateId, userId);
    }

    @Patch('reorder')
    @ReorderProjectStatesSwagger()
    async reorder(
        @Param('slug') slug: string,
        @Body() dto: ReorderProjectsStatesDto,
        @GetUserId() userId: string,
    ) {
        return this.facade.reoderStates(slug, dto, userId);
    }

    @Patch(':stateId')
    @UpdateProjectStateSwagger()
    async update(
        @Param('slug') slug: string,
        @Param('stateId') stateId: string,
        @Body() dto: UpdateProjectStateDto,
        @GetUserId() userId: string,
    ) {
        return this.facade.updateState(slug, stateId, dto, userId);
    }

    @Post(':stateId/restore')
    @RestoreProjectStateSwagger()
    async restore(
        @Param('slug') slug: string,
        @Param('stateId') stateId: string,
        @GetUserId() userId: string,
    ) {
        return this.facade.restoreState(slug, stateId, userId);
    }
}
