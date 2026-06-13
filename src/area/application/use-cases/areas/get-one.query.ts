import { IAreaRepository } from '@core/area/domain/repository';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class GetAreaQuery {
    constructor(
        @Inject('IAreaRepository')
        private readonly areaRepo: IAreaRepository,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, key: string, userId: string) {
        const { project } = await this.projectPolicy.ensureProjectAccess(slug, userId);

        const area = await this.areaRepo.findBySlug(project.slug, key);

        if (!area) {
            throw new BaseException({ code: '', message: '' }, HttpStatus.NOT_FOUND);
        }

        return area;
    }
}
