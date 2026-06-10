import { ProjectErrorCodes, ProjectErrorMessages } from '@core/projects/domain/errors';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { IProjectsRepository, IProjectStatesRepository } from '@core/projects/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class GetStatesQuery {
    constructor(
        @Inject('IProjectsRepository')
        private readonly projectsRepo: IProjectsRepository,
        @Inject('IProjectStatesRepository')
        private readonly projectStatesRepo: IProjectStatesRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, query: unknown, userId: string) {
        const project = await this.projectsRepo.findOne(slug);

        if (!project) {
            throw new BaseException(
                {
                    code: ProjectErrorCodes.NOT_FOUND,
                    message: ProjectErrorMessages[ProjectErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        await this.policy.ensureTeamAccess(project.teamId, userId, 'viewer');

        const states = await this.projectStatesRepo.find(project.id, query);

        return states;
    }
}
