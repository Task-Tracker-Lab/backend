import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { teams, teamMembers } from '../../infrastructure/persistence/models';

export type Team = InferSelectModel<typeof teams>;
export type NewTeam = InferInsertModel<typeof teams>;

export type TeamMember = InferSelectModel<typeof teamMembers>;
export type NewTeamMember = InferInsertModel<typeof teamMembers>;

export type TeamWithMembers = Team & {
    members: TeamMember[];
};
