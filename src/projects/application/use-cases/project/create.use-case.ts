import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { CreateProjectDto } from '../../dtos';
import { IProjectRepository } from '@core/projects/domain/repository';
import { PROJECT_STATUSES } from '@core/projects/domain/entities';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { BaseException } from '@shared/error';
import { ProjectErrorCodes, ProjectErrorMessages } from '@core/projects/domain/errors';
import slugify from 'slugify';

// TODO: at feature migrate to dynamic field at team
const MAX_PROJECTS_PER_TEAM = 20;

@Injectable()
export class CreateProjectUseCase {
    constructor(
        @Inject('IProjectRepository') private readonly projectsRepo: IProjectRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    public async execute(userId: string, teamId: string, dto: CreateProjectDto) {
        const { settings, ...project } = dto;
        const { team } = await this.policy.ensureTeamAccess(teamId, userId, 'admin');

        console.log(settings);

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
