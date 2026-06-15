import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { projectMembers } from '@shared/entities';

export type Member = InferSelectModel<typeof projectMembers>;
export type NewMember = InferInsertModel<typeof projectMembers>;

export interface MemberWithUser extends Member {
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
    };
}
