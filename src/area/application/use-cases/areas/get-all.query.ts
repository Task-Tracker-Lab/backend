import { IAreaRepository } from '@core/area/domain/repository';
import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetAreasQuery {
    constructor(
        @Inject('IAreaRepository')
        private readonly areaRepo: IAreaRepository,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, userId: string, _query: unknown) {
        const { project } = await this.projectPolicy.ensureProjectAccess(slug, userId);
        const areas = await this.areaRepo.findAll(project.id);

        return areas.map((a) => ({
            ...a,
            createdAt: new Date(a.createdAt).toISOString(),
            updatedAt: new Date(a.updatedAt).toISOString(),
        }));
    }
}
