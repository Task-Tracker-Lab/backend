import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { IProjectRepository } from '@core/project/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

import { ProjectQuery } from '../../dtos';
import { ProjectMapper } from '../../mappers';

@Injectable()
export class FindProjectsByTeamQuery {
    constructor(
        @Inject('IProjectRepository')
        private readonly projectsRepo: IProjectRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    public async execute(teamId: string, userId: string, query: ProjectQuery) {
        const { team, member } = await this.policy.ensureTeamAccess(teamId, userId, 'viewer');
        const { items, meta } = await this.projectsRepo.findByTeam(team.id, query);
        const data = items.map((p) => ProjectMapper.toListResponse(p, member));

        return {
            items: data,
            meta,
        };
    }
}
