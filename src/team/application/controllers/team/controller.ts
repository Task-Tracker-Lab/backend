import { CreateTeamDto, UpdateTeamDto } from '@core/team/application/dtos';
import { TeamFacade } from '@core/team/application/team.facade';
import { Body, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';

import {
    CreateTeamSwagger,
    FindOneTeamSwagger,
    RemoveTeamSwagger,
    UpdateTeamSwagger,
} from './swagger';

@ApiBaseController('teams', 'Teams', true)
export class TeamController {
    constructor(private readonly facade: TeamFacade) {}

    @Post()
    @CreateTeamSwagger()
    async create(@GetUserId() userId: string, @Body() dto: CreateTeamDto) {
        return this.facade.createTeam(userId, dto);
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
