import type { team, teamMembers } from '../../infrastructure/persistence/models';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type Team = InferSelectModel<typeof team>;
export type NewTeam = InferInsertModel<typeof team>;

export type TeamMember = InferSelectModel<typeof teamMembers>;
export type NewTeamMember = InferInsertModel<typeof teamMembers>;

export type TeamWithMembers = Team & {
    readonly members: readonly TeamMember[];
};
