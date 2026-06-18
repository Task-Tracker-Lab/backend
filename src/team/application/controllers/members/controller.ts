import { Body, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';

import { UpdateMemberDto } from '../../dtos';
import { TeamFacade } from '../../team.facade';

import { GetMembersSwagger, RemoveMemberSwagger, UpdateMemberSwagger } from './swagger';

@ApiBaseController('teams/:teamId', 'Teams Members', true)
export class TeamMembersController {
    constructor(private readonly facade: TeamFacade) {}

    @Get('members')
    @GetMembersSwagger()
    async getMembers(@Param('teamId') teamId: string) {
        return this.facade.getMembers(teamId);
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
