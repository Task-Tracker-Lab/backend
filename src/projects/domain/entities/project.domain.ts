import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { projects, projectShares } from '../../infrastructure/persistence/models/project.model';

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;

export interface ProjectSettings {
    allowGuestComments?: boolean;
    defaultAssigneeId?: string;
    showTaskNumbers?: boolean;
}

export type ProjectWithTypedSettings = Omit<Project, 'settings'> & {
    settings: ProjectSettings;
};

export type ProjectShare = InferSelectModel<typeof projectShares>;
export type NewProjectShare = InferInsertModel<typeof projectShares>;
