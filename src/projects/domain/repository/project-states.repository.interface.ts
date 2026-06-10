import { NewProjectState, ProjectState } from '../entities';

export interface IProjectStatesRepository {
    create(dto: NewProjectState): Promise<{ id: string }>;
    update(projectId: string, stateId: string, dto: Partial<ProjectState>): Promise<boolean>;
    delete(projectId: string, stateId: string): Promise<boolean>;
    findOne(projectId: string, stateId: string, deleted?: boolean): Promise<ProjectState | null>;
    find(projectId: string, query?: unknown): Promise<ProjectState[]>;

    findByTitle(projectId: string, title: string): Promise<ProjectState | null>;

    // TODO: FIX that any, to coerce
    findByStateType(projectId: string, stateType: any): Promise<ProjectState | null>;

    countByProject(projectId: string): Promise<number>;
}
