import type { teams, teamMembers } from '../../infrastructure/persistence/models';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type Team = InferSelectModel<typeof teams>;
export type NewTeam = InferInsertModel<typeof teams>;

export type TeamMember = InferSelectModel<typeof teamMembers>;
export type NewTeamMember = InferInsertModel<typeof teamMembers>;

export type TeamWithMembers = Team & {
    members: TeamMember[];
};
