import { Inject, Injectable } from '@nestjs/common';
import { ProjectsMapper } from '../mappers';
import { IProjectsRepository } from '@core/projects/domain/repository';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';

@Injectable()
export class FindProjectsByTeamQuery {
    constructor(
        @Inject('IProjectsRepository')
        private readonly projectsRepo: IProjectsRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    public async execute(slug: string, userId: string) {
        const { team, member } = await this.policy.ensureTeamAccess(slug, userId, 'viewer');
        const projects = await this.projectsRepo.findByTeam(team.id);
        const items = projects.map((p) => ProjectsMapper.toListResponse(p, member));

        return {
            team: {
                id: team.id,
                name: team.name,
                slug: team.slug,
                role: member.role,
            },
            // TODO: реализовать полноценную пагинацию для проектов команды.
            items,
            meta: {
                total: items.length,
                totalPages: items.length ? 1 : 0,
                page: 1,
                limit: 10,
                hasPrevPage: false,
                hasNextPage: false,
            },
        };
    }
}
