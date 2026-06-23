import { TeamMembersQuery, UpdateMemberDto } from '@core/team/application/dtos';
import { TeamFacade } from '@core/team/application/team.facade';
import { Body, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';

import { GetMembersSwagger, RemoveMemberSwagger, UpdateMemberSwagger } from './swagger';

@ApiBaseController('teams/:teamId', 'Teams Members', true)
export class TeamMembersController {
    constructor(private readonly facade: TeamFacade) {}

    @Get('members')
    @GetMembersSwagger()
    async getMembers(@Param('teamId') teamId: string, @Query() query: TeamMembersQuery) {
        return this.facade.getMembers(teamId, query);
    }

    @Patch('members/:userId')
    @UpdateMemberSwagger()
    async updateMember(
        @Param('teamId') teamId: string,
        @Param('userId') targetUserId: string,
        @GetUserId() currentUserId: string,
        @Body() dto: UpdateMemberDto,
    ) {
        return this.facade.updateMember(teamId, currentUserId, targetUserId, dto);
    }

    @Delete('members/:userId')
    @RemoveMemberSwagger()
    async removeMember(
        @Param('teamId') teamId: string,
        @Param('userId') targetUserId: string,
        @GetUserId() currentUserId: string,
    ) {
        return this.facade.removeMember(teamId, currentUserId, targetUserId);
    }
}
