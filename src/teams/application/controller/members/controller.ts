import { Body, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiBaseController, GetUserId } from '@shared/decorators';
import { GetMembersSwagger, RemoveMemberSwagger, UpdateMemberSwagger } from './swagger';
import type { UpdateMemberDto } from '../../dtos/member.dto';
import { TeamsFacade } from '../../team.facade';

@ApiBaseController('teams/:teamId', 'Teams Members', true)
export class TeamsMembersController {
    constructor(private readonly facade: TeamsFacade) {}

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
