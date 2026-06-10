import {
    ProjectErrorCodes,
    ProjectErrorMessages,
    ProjectStateErrorCodes,
    ProjectStateErrorMessages,
} from '@core/projects/domain/errors';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { IProjectsRepository, IProjectStatesRepository } from '@core/projects/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class GetStateQuery {
    constructor(
        @Inject('IProjectsRepository')
        private readonly projectRepo: IProjectsRepository,
        @Inject('IProjectStatesRepository')
        private readonly projectStatesRepo: IProjectStatesRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, stateId: string, userId: string) {
        const project = await this.projectRepo.findOne(slug);

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

        const state = await this.projectStatesRepo.findOne(project.id, stateId);

        if (!state) {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.NOT_FOUND,
                    message: ProjectStateErrorMessages[ProjectStateErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return state;
    }
}
