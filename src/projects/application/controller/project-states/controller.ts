import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBaseController, Public } from '@shared/decorators';
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

@ApiBaseController('projects/:slug/states', 'Project States', true)
export class ProjectsStatesController {
    constructor(private readonly facade: ProjectsFacade) {
        void this.facade;
    }

    @Get()
    @Public()
    @FindAllProjectStatesSwagger()
    async getAll(
        @Param('projectId') projectId: string,
        @Query('hidden') hidden?: boolean,
        @Query('counts') counts?: boolean,
        @Query('my') my?: boolean,
        @Query('category') category?: string,
        @Query('overdue') overdue?: boolean,
    ) {
        return { projectId, hidden, category, my, counts, overdue };
    }

    @Get(':stateSlug')
    @FindOneProjectStateSwagger()
    async findOne(@Param('slug') slug: string, @Param('stateSlug') stateSlug: string) {
        return { slug, stateSlug };
    }

    @Post()
    @CreateProjectStateSwagger()
    async create(@Param('slug') slug: string, @Body() dto: any) {
        return { slug, dto };
    }

    @Delete(':stateSlug')
    @RemoveProjectStateSwagger()
    async delete(@Param('slug') slug: string, @Param('stateSlug') stateSlug: string) {
        return { slug, stateSlug };
    }

    @Patch('reorder')
    @ReorderProjectStatesSwagger()
    async reorder(@Param('slug') slug: string, @Body() dto: unknown) {
        return { slug, dto };
    }

    @Patch(':stateSlug')
    @UpdateProjectStateSwagger()
    async update(
        @Param('slug') slug: string,
        @Param('stateSlug') stateSlug: string,
        @Body() dto: unknown,
    ) {
        return { slug, stateSlug, dto };
    }

    @Post(':stateSlug/restore')
    @RestoreProjectStateSwagger()
    async restore(@Param('slug') slug: string, @Param('stateSlug') stateSlug: string) {
        return { slug, stateSlug };
    }
}
