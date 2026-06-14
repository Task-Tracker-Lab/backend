import type { Member, MemberRole, NewMember } from '../entities';

export interface IMemberRepository {
    create(data: NewMember): Promise<{ id: string }>;
    updateRole(memberId: string, role: MemberRole): Promise<Member | null>;
    delete(memberId: string): Promise<boolean>;

    findById(memberId: string): Promise<Member | null>;
    findByProjectAndUser(projectId: string, userId: string): Promise<Member | null>;
    findByProject(projectId: string): Promise<Member[]>;

    isMember(projectId: string, userId: string): Promise<boolean>;
    getUserRole(projectId: string, userId: string): Promise<MemberRole | null>;

    countByProject(projectId: string): Promise<number>;
}
