import { Body, Get, Param, Delete, Patch, Post } from '@nestjs/common';
import { ApiBaseController, GetUser, GetUserId } from '@shared/decorators';
import {
    AcceptInviteSwagger,
    DeleteTeamInvitationSwagger,
    GetTeamInvitationSwagger,
    GetTeamInvitationsSwagger,
    InviteMemberSwagger,
    UpdateTeamInvitationSwagger,
} from './swagger';
import type { JwtPayload } from '@shared/types';
import { InviteMemberDto, UpdateInvitationDto } from '../../dtos';
import { TeamsFacade } from '../../team.facade';

@ApiBaseController('teams/:teamId/invitations', 'Teams Invitations', true)
export class TeamsInvitationsController {
    constructor(private readonly facade: TeamsFacade) {}

    @Get()
    @GetTeamInvitationsSwagger()
    async getAll(@Param('teamId') teamId: string, @GetUserId() userId: string) {
        return this.facade.getInvitations(teamId, userId);
    }

    @Get(':code')
    @GetTeamInvitationSwagger()
    async getOne(
        @Param('teamId') teamId: string,
        @Param('code') code: string,
        @GetUser() user: JwtPayload,
    ) {
        return this.facade.getInvitation(teamId, code, user.sub, user.email);
    }

    @Post()
    @InviteMemberSwagger()
    async invite(
        @Param('teamId') teamId: string,
        @GetUserId() inviterId: string,
        @Body() dto: InviteMemberDto,
    ) {
        return this.facade.invite(teamId, inviterId, dto);
    }

    @Post(':code/accept')
    @AcceptInviteSwagger()
    async accept(@Param('code') code: string, @GetUser() user: JwtPayload) {
        return this.facade.acceptInvite(code, user.sub, user.email);
    }

    @Patch(':code')
    @UpdateTeamInvitationSwagger()
    async update(
        @Param('teamId') teamId: string,
        @Param('code') code: string,
        @GetUserId() userId: string,
        @Body() dto: UpdateInvitationDto,
    ) {
        return this.facade.updateInvitation(teamId, code, userId, dto);
    }

    @Delete(':code')
    @DeleteTeamInvitationSwagger()
    async decline(
        @Param('teamId') teamId: string,
        @Param('code') code: string,
        @GetUser() user: JwtPayload,
    ) {
        return this.facade.declineInvitation(teamId, code, user.sub, user.email);
    }
}
