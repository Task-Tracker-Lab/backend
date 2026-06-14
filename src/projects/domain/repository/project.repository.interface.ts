import type { NewProject, NewProjectShare, Project } from '../entities';

export interface IProjectRepository {
    create(userId: string, data: NewProject): Promise<{ result: boolean; slug: string }>;
    update(teamId: string, projectId: string, data: Partial<NewProject>): Promise<boolean>;
    delete(teamId: string, projectId: string): Promise<boolean>;
    findOne(projectId: string, teamId?: string): Promise<Project | null>;
    findByTeam(teamId: string): Promise<Project[]>;
    createShare(data: NewProjectShare): Promise<boolean>;

    findBySlug(slug: string, teamId?: string): Promise<Project | null>;

    hasValidShareToken(slug: string, token: string): Promise<boolean>;
    revokeAllShares(projectId: string): Promise<boolean>;

    countByTeam(teamId: string): Promise<number>;
}
