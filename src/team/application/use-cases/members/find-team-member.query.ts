import { Inject, Injectable } from '@nestjs/common';

import { ITeamRepository } from '../../../domain/repository';

@Injectable()
export class FindTeamMemberQuery {
    constructor(
        @Inject('ITeamRepository')
        private readonly repository: ITeamRepository,
    ) {}

    async execute(teamId: string, userId: string) {
        return this.repository.findMember(teamId, userId);
    }
}
