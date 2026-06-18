import { CreateTeamUseCase } from './base/create-team.use-case';
import { DeleteTeamUseCase } from './base/delete-team.use-case';
import { FindTeamQuery } from './base/find-team.query';
import { GetMyTeamsUseCase } from './base/get-my-teams.use-case';
import { UpdateTeamUseCase } from './base/update-team.use-case';
import { AcceptInvitationUseCase } from './invitions/accept-invitation.use-case';
import { DeleteInvitationUseCase } from './invitions/delete-invitation.use-case';
import { GetInvitationQuery } from './invitions/get-invitation.query';
import { GetInvitationsQuery } from './invitions/get-invitations.query';
import { GetMyInvitesUseCase } from './invitions/get-my-invites.use-case';
import { SendInvitationUseCase } from './invitions/send-invitation.use-case';
import { UpdateInvitationUseCase } from './invitions/update-invitation.use-case';
import { FindTeamMemberQuery } from './members/find-team-member.query';
import { GetTeamMembersQuery } from './members/get-team-members.query';
import { RemoveTeamMemberUseCase } from './members/remove-team-member.use-case';
import { UpdateTeamMemberUseCase } from './members/update-team-member.use-case';

export const TeamQueries = [
    FindTeamQuery,
    FindTeamMemberQuery,
    GetInvitationQuery,
    GetInvitationsQuery,
    GetTeamMembersQuery,
    GetMyInvitesUseCase,
    GetMyTeamsUseCase,
];

export const TeamUseCases = [
    AcceptInvitationUseCase,
    CreateTeamUseCase,
    DeleteTeamUseCase,
    RemoveTeamMemberUseCase,
    SendInvitationUseCase,
    UpdateTeamUseCase,
    UpdateTeamMemberUseCase,
    UpdateInvitationUseCase,
    DeleteInvitationUseCase,
];

export const TEAM_EXTERNAL_QUERIES = [FindTeamQuery, FindTeamMemberQuery];
export const TEAM_EXTERNAL_COMMANDS = [CreateTeamUseCase];

export { FindTeamQuery } from './base/find-team.query';
export { FindTeamMemberQuery } from './members/find-team-member.query';
export { GetInvitationQuery } from './invitions/get-invitation.query';
export { GetInvitationsQuery } from './invitions/get-invitations.query';
export { GetTeamMembersQuery } from './members/get-team-members.query';
export { GetMyInvitesUseCase } from './invitions/get-my-invites.use-case';
export { GetMyTeamsUseCase } from './base/get-my-teams.use-case';
export { AcceptInvitationUseCase } from './invitions/accept-invitation.use-case';
export { CreateTeamUseCase } from './base/create-team.use-case';
export { DeleteTeamUseCase } from './base/delete-team.use-case';

export { RemoveTeamMemberUseCase } from './members/remove-team-member.use-case';
export { SendInvitationUseCase } from './invitions/send-invitation.use-case';
export { UpdateTeamUseCase } from './base/update-team.use-case';
export { UpdateTeamMemberUseCase } from './members/update-team-member.use-case';
export { UpdateInvitationUseCase } from './invitions/update-invitation.use-case';
export { DeleteInvitationUseCase } from './invitions/delete-invitation.use-case';
