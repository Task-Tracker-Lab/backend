import type { Area, NewArea } from '../entities';

export interface IAreaRepository {
    create(dto: NewArea): Promise<{ id: string }>;
    update(projectId: string, areaId: string, dto: Partial<Area>): Promise<boolean>;
    delete(projectId: string, areaId: string): Promise<boolean>;
    findOne(projectId: string, areaId: string, includeDeleted?: boolean): Promise<Area | null>;
    findAll(projectId: string, includeDeleted?: boolean): Promise<Area[]>;
    findBySlug(projectId: string, slug: string): Promise<Area | null>;
}
