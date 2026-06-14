import { IProjectRepository } from '@core/projects/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CheckSlugAvailabilityQuery {
    constructor(
        @Inject('IProjectRepository')
        private readonly projectsRepo: IProjectRepository,
    ) {}

    async execute(teamId: string, slug: string) {
        const project = await this.projectsRepo.findBySlug(slug.toLowerCase(), teamId);

        return {
            available: !project,
            reason: project ? 'Этот slug уже занят' : null,
        };
    }
}
