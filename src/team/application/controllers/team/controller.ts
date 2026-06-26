import { ProjectQueues, ProjectWorkspaceJobs } from '@core/project/domain/enums';
import { ProjectCreateEvent } from '@core/project/domain/events';
import { InjectQueue } from '@nestjs/bullmq';
import { Body, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';
import { Queue } from 'bullmq';

import { CreateTeamDto, UpdateTeamDto } from '../../dtos';
import { TeamFacade } from '../../team.facade';

import {
    CreateTeamSwagger,
    FindOneTeamSwagger,
    RemoveTeamSwagger,
    UpdateTeamSwagger,
} from './swagger';

@ApiBaseController('teams', 'Teams', true)
export class TeamController {
    constructor(
        private readonly facade: TeamFacade,
        @InjectQueue(ProjectQueues.PROJECT_WORKSPACE)
        private readonly projectQueue: Queue,
    ) {}

    @Post()
    @CreateTeamSwagger()
    async create(@GetUserId() userId: string, @Body() dto: CreateTeamDto) {
        const result = await this.facade.createTeam(userId, dto);

        const event = new ProjectCreateEvent(userId, result.teamId);
        await this.projectQueue.add(ProjectWorkspaceJobs.CREATE_PROJECT, event);

        return result;
    }

    @Get(':id')
    @FindOneTeamSwagger()
    async findOne(@Param('id') id: string) {
        return this.facade.getTeamById(id);
    }

    @Patch(':id')
    @UpdateTeamSwagger()
    async update(@Param('id') id: string, @GetUserId() userId: string, @Body() dto: UpdateTeamDto) {
        return this.facade.updateTeam(id, userId, dto);
    }

    @Delete(':id')
    @RemoveTeamSwagger()
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string, @GetUserId() userId: string) {
        return this.facade.deleteTeam(id, userId);
    }
}
