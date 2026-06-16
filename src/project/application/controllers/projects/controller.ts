import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBaseController, GetUserId, Public } from '@shared/decorators';

import { CreateProjectDto, CreateShareTokenDto, UpdateProjectDto } from '../../dtos';
import { ProjectFacade } from '../../project.facade';

import {
    ArchiveProjectSwagger,
    CheckSlugSwagger,
    CreateProjectSwagger,
    CreateShareTokenSwagger,
    FindAllProjectsSwagger,
    FindOneProjectSwagger,
    RemoveProjectSwagger,
    UpdateProjectSwagger,
} from './swagger';

@ApiBaseController('teams/:teamId/projects', 'Projects', true)
export class ProjectsController {
    constructor(private readonly facade: ProjectFacade) {}

    @Get()
    @FindAllProjectsSwagger()
    async findAll(@Param('teamId') teamId: string, @GetUserId() userId: string) {
        return this.facade.getTeamProjects(teamId, userId);
    }

    @Get(':slug')
    @Public()
    @FindOneProjectSwagger()
    async getOne(
        @Param('slug') slug: string,
        @Param('teamId') teamId: string,
        @GetUserId() userId?: string,
        @Query('token') token?: string,
    ) {
        return this.facade.getDetail(slug, teamId, userId, token);
    }

    @Post(':slug/share')
    @CreateShareTokenSwagger()
    async generateShareToken(
        @Param('slug') slug: string,
        @Param('teamId') teamId: string,
        @GetUserId() userId: string,
        @Body() dto: CreateShareTokenDto,
    ) {
        return this.facade.generateShareToken(slug, teamId, userId, dto);
    }

    @Get('check-slug')
    @CheckSlugSwagger()
    async checkSlug(@Param('teamId') teamId: string, @Query('q') slug: string) {
        return this.facade.checkSlugAvailability(teamId, slug);
    }

    @Post(':slug/archive')
    @ArchiveProjectSwagger()
    async archive(
        @Param('slug') slug: string,
        @Param('teamId') teamId: string,
        @GetUserId() userId: string,
    ) {
        return this.facade.setStatus(slug, teamId, userId, 'archived');
    }

    @Post()
    @CreateProjectSwagger()
    async create(
        @Param('teamId') teamId: string,
        @GetUserId() userId: string,
        @Body() dto: CreateProjectDto,
    ) {
        return this.facade.create(userId, teamId, dto);
    }

    @Patch(':slug')
    @UpdateProjectSwagger()
    async update(
        @Param('slug') slug: string,
        @Param('teamId') teamId: string,
        @GetUserId() userId: string,
        @Body() dto: UpdateProjectDto,
    ) {
        return this.facade.update(slug, teamId, userId, dto);
    }

    @Delete(':slug')
    @RemoveProjectSwagger()
    async remove(
        @Param('slug') slug: string,
        @Param('teamId') teamId: string,
        @GetUserId() userId: string,
    ) {
        return this.facade.delete(slug, teamId, userId);
    }
}
