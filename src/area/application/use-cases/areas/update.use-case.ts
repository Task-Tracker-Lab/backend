import { IAreaRepository } from '@core/area/domain/repository';
import { Inject, Injectable } from '@nestjs/common';
import { UpdateAreaDto } from '../../dtos';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';

@Injectable()
export class UpdateAreaUseCase {
    constructor(
        @Inject('IAreaRepository')
        private readonly areaRepo: IAreaRepository,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, key: string, dto: UpdateAreaDto, userId: string) {
        (void this.areaRepo, this.projectPolicy, dto);

        return {
            success: true,
            message: '',
            slug,
            key,
            userId,
        };
    }
}
