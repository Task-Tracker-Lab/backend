import type { Area, NewArea } from '../entities';

export interface IAreaRepository {
    create(dto: NewArea): Promise<{ readonly slug: string }>;
    update(projectId: string, areaId: string, dto: Partial<Area>): Promise<boolean>;
    delete(projectId: string, areaId: string): Promise<boolean>;
    findOne(projectId: string, areaId: string, includeDeleted?: boolean): Promise<Area | null>;
    findAll(projectId: string, includeDeleted?: boolean): Promise<readonly Area[]>;
    findBySlug(slug: string, projectId?: string): Promise<Area | null>;

    countByProject(projectId: string): Promise<number>;
}
