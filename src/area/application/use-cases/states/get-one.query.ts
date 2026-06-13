import { ProjectStateErrorCodes, ProjectStateErrorMessages } from '@core/area/domain/errors';
import { IStateRepository } from '@core/area/domain/repository';
import { FindProjectQuery } from '@core/projects';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class GetStateQuery {
    constructor(
        @Inject('IStateRepository')
        private readonly stateRepo: IStateRepository,
        private readonly findProjectQ: FindProjectQuery,
    ) {}

    async execute(slug: string, stateId: string, userId: string) {
        const { project } = await this.findProjectQ.execute(slug, 'teamId??', 'viewer', userId);

        const state = await this.stateRepo.findOne(project.id, stateId);

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
