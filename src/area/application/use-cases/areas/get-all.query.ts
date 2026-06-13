import { IAreaRepository } from '@core/area/domain/repository';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetAreasQuery {
    constructor(
        @Inject('IAreaRepository')
        private readonly areaRepo: IAreaRepository,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, dto: unknown, userId: string) {
        (void this.areaRepo, this.projectPolicy);

        return {
            success: true,
            message: '',
            slug,
            dto,
            userId,
        };
    }
}
