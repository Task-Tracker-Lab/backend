import { IAreaRepository } from '@core/area/domain/repository';
import { Inject, Injectable } from '@nestjs/common';
import { CreateAreaDto } from '../../dtos';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';

@Injectable()
export class CreateAreaUseCase {
    constructor(
        @Inject('IAreaRepository')
        private readonly areaRepo: IAreaRepository,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, dto: CreateAreaDto, userId: string) {
        const { member, project } = await this.projectPolicy.ensureProjectAccess(slug, userId, [
            'admin',
            'owner',
        ]);

        (void member, project, dto);
        void this.areaRepo;

        return {
            success: true,
            message: '',
        };
    }
}
