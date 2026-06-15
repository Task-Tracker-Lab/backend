import { Injectable } from '@nestjs/common';
import * as UC from './use-cases';
import type {
    CreateTeamDto,
    InviteMemberDto,
    UpdateInvitationDto,
    UpdateMemberDto,
    UpdateTeamDto,
} from './dtos';

@Injectable()
export class TeamsFacade {
    constructor(
        private readonly findTeamQ: UC.FindTeamQuery,
        private readonly getInvitationQ: UC.GetInvitationQuery,
        private readonly getInvitationsQ: UC.GetInvitationsQuery,
        private readonly getTeamMembersQ: UC.GetTeamMembersQuery,

        private readonly createTeamUc: UC.CreateTeamUseCase,
        private readonly deleteTeamUc: UC.DeleteTeamUseCase,
        private readonly updateTeamUc: UC.UpdateTeamUseCase,

        private readonly updateMemberUc: UC.UpdateTeamMemberUseCase,
        private readonly removeMemberUc: UC.RemoveTeamMemberUseCase,
        private readonly sendInviteUc: UC.SendInvitationUseCase,
        private readonly acceptInviteUc: UC.AcceptInvitationUseCase,
        private readonly updateInvitationUc: UC.UpdateInvitationUseCase,
        private readonly declineInvitationUc: UC.DeclineInvitationUseCase,

        private readonly getMyTeamsUc: UC.GetMyTeamsUseCase,
        private readonly getMyInvitesUc: UC.GetMyInvitesUseCase,
    ) {}

    public getTeamById = (teamId: string) => this.findTeamQ.execute(teamId);

    public getInvitation = (teamId: string, code: string, userId: string, userEmail: string) =>
        this.getInvitationQ.execute(teamId, code, userId, userEmail);

    public createTeam = (ownerId: string, dto: CreateTeamDto) =>
        this.createTeamUc.execute(ownerId, dto);

    public updateTeam = (teamId: string, userId: string, dto: UpdateTeamDto) =>
        this.updateTeamUc.execute(teamId, userId, dto);

    public deleteTeam = (teamId: string, userId: string) =>
        this.deleteTeamUc.execute(teamId, userId);

    public getMembers = (teamId: string) => this.getTeamMembersQ.execute(teamId);

    public updateMember = (teamId: string, curr: string, target: string, dto: UpdateMemberDto) =>
        this.updateMemberUc.execute(teamId, curr, target, dto);

    public removeMember = (teamId: string, curr: string, target: string) =>
        this.removeMemberUc.execute(teamId, curr, target);

    public getInvitations = (teamId: string, userId: string) =>
        this.getInvitationsQ.execute(teamId, userId);

    public invite = (teamId: string, inviterId: string, dto: InviteMemberDto) =>
        this.sendInviteUc.execute(teamId, inviterId, dto);

    public acceptInvite = (code: string, userId: string, email: string) =>
        this.acceptInviteUc.execute(code, userId, email);

    public declineInvitation = (teamId: string, code: string, userId: string, userEmail: string) =>
        this.declineInvitationUc.execute(teamId, code, userId, userEmail);

    public updateInvitation = (
        teamId: string,
        code: string,
        userId: string,
        dto: UpdateInvitationDto,
    ) => this.updateInvitationUc.execute(teamId, code, userId, dto);

    public getMyTeams = (userId: string, pagination: any) =>
        this.getMyTeamsUc.execute(userId, pagination);

    public getMyInvites = (email: string) => this.getMyInvitesUc.execute(email);
}
