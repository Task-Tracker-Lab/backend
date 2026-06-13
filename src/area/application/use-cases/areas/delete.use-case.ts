import { IAreaRepository } from '@core/area/domain/repository';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteAreaUseCase {
    constructor(
        @Inject('IAreaRepository')
        private readonly areaRepo: IAreaRepository,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, key: string, userId: string) {
        (void this.areaRepo, this.projectPolicy);

        return {
            success: true,
            message: '',
            slug,
            key,
            userId,
        };
    }
}
