import type { NewProject, NewProjectShare, Project } from '../entities';

export interface IProjectsRepository {
    create(data: NewProject): Promise<{ result: boolean; slug: string }>;
    update(slug: string, data: Partial<NewProject>): Promise<boolean>;
    delete(slug: string): Promise<boolean>;
    findOne(slug: string): Promise<Project | null>;
    findByTeam(teamId: string): Promise<Project[]>;
    createShare(data: NewProjectShare): Promise<boolean>;
    hasValidShareToken(slug: string, token: string): Promise<boolean>;
    revokeAllShares(projectId: string): Promise<boolean>;
}
