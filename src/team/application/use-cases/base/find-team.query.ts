import { Inject, Injectable } from '@nestjs/common';

import { ITeamRepository } from '../../../domain/repository';

@Injectable()
export class FindTeamQuery {
    constructor(
        @Inject('ITeamRepository')
        private readonly repository: ITeamRepository,
    ) {}

    async execute(teamId: string) {
        //TODO: add avatarURL handling
        return this.repository.findById(teamId);
    }
}
