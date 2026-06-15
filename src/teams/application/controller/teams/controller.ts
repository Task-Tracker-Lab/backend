import { Body, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';

import { CreateTeamDto, UpdateTeamDto } from '../../dtos';
import { TeamsFacade } from '../../team.facade';

import {
    CreateTeamSwagger,
    FindOneTeamSwagger,
    RemoveTeamSwagger,
    UpdateTeamSwagger,
} from './swagger';

@ApiBaseController('teams', 'Teams', true)
export class TeamsController {
    constructor(private readonly facade: TeamsFacade) {}

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
