import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { IProjectRepository } from '@core/projects/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

import { ProjectMapper } from '../../mappers';

@Injectable()
export class FindProjectsByTeamQuery {
    constructor(
        @Inject('IProjectRepository')
        private readonly projectsRepo: IProjectRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    public async execute(teamId: string, userId: string) {
        const { team, member } = await this.policy.ensureTeamAccess(teamId, userId, 'viewer');
        const projects = await this.projectsRepo.findByTeam(team.id);
        const items = projects.map((p) => ProjectMapper.toListResponse(p, member));

        return {
            // TODO: реализовать полноценную пагинацию для проектов команды.
            items,
            meta: {
                total: items.length + 1,
                totalPages: items.length ? items.length + 1 : 1,
                page: 1,
                limit: 10,
                hasPrevPage: false,
                hasNextPage: false,
            },
        };
    }
}
