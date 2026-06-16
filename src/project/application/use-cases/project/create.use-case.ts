import { PROJECT_STATUSES } from '@core/project/domain/entities';
import { ProjectErrorCodes, ProjectErrorMessages } from '@core/project/domain/errors';
import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { IProjectRepository } from '@core/project/domain/repository';
import { MAX_PROJECTS_PER_TEAM } from '@core/project/infrastructure/constants';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import slugify from 'slugify';

import { CreateProjectDto } from '../../dtos';

@Injectable()
export class CreateProjectUseCase {
    constructor(
        @Inject('IProjectRepository') private readonly projectsRepo: IProjectRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    public async execute(userId: string, teamId: string, dto: CreateProjectDto) {
        const { settings: _s, ...project } = dto;
        const { team } = await this.policy.ensureTeamAccess(teamId, userId, 'admin');

        const currentSlug = slugify(project?.slug ? project.slug : project.name, {
            lower: true,
            strict: true,
        });

        const slugExists = await this.projectsRepo.findBySlug(currentSlug, team.id);

        if (slugExists) {
            throw new BaseException(
                {
                    code: ProjectErrorCodes.SLUG_DUPLICATE,
                    message: ProjectErrorMessages[ProjectErrorCodes.SLUG_DUPLICATE],
                },
                HttpStatus.CONFLICT,
            );
        }

        const projectCount = await this.projectsRepo.countByTeam(team.id);
        if (projectCount >= MAX_PROJECTS_PER_TEAM) {
            throw new BaseException(
                {
                    code: ProjectErrorCodes.MAX_PROJECTS_REACHED,
                    message: ProjectErrorMessages[ProjectErrorCodes.MAX_PROJECTS_REACHED],
                },
                HttpStatus.FORBIDDEN,
            );
        }

        const data = {
            ...project,
            teamId: team.id,
            ownerId: userId,
            slug: currentSlug,
            status: PROJECT_STATUSES[0],
        };

        const { result, slug } = await this.projectsRepo.create(userId, data);

        if (!result) {
            throw new BaseException(
                {
                    code: ProjectErrorCodes.CREATE_FAILED,
                    message: ProjectErrorMessages[ProjectErrorCodes.CREATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return {
            success: result,
            message: `Проект ${dto.name} успешно создан`,
            slug,
        };
    }
}
