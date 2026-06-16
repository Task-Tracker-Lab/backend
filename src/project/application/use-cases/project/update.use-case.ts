import { ProjectErrorCodes, ProjectErrorMessages } from '@core/project/domain/errors';
import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { IProjectRepository } from '@core/project/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import slugify from 'slugify';

import { UpdateProjectDto } from '../../dtos';

@Injectable()
export class UpdateProjectUseCase {
    constructor(
        @Inject('IProjectRepository')
        private readonly projectsRepo: IProjectRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    public async execute(slug: string, teamId: string, userId: string, dto: UpdateProjectDto) {
        const { team } = await this.policy.ensureTeamAccess(teamId, userId, 'admin');

        const project = await this.projectsRepo.findBySlug(slug, team.id);
        if (!project) {
            throw new BaseException(
                {
                    code: ProjectErrorCodes.NOT_FOUND,
                    message: ProjectErrorMessages[ProjectErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (dto.slug && dto.slug !== project.slug) {
            const slugExists = await this.projectsRepo.findBySlug(dto.slug, team.id);
            if (slugExists) {
                throw new BaseException(
                    {
                        code: ProjectErrorCodes.SLUG_DUPLICATE,
                        message: ProjectErrorMessages[ProjectErrorCodes.SLUG_DUPLICATE],
                    },
                    HttpStatus.CONFLICT,
                );
            }
        }

        const data = {
            ...(dto.slug && { slug: slugify(dto.slug, { lower: true, strict: true }) }),
            ...(dto.name && { name: dto.name.trim() }),
            ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
            ...(dto.descriptionHtml !== undefined && {
                descriptionHtml: dto.descriptionHtml?.trim() || null,
            }),
            ...(dto.icon !== undefined && { icon: dto.icon || null }),
            ...(dto.color !== undefined && { color: dto.color || null }),
            ...(dto.sequence !== undefined && { sequence: dto.sequence }),
            ...(dto.visibility && { visibility: dto.visibility }),
        };

        if (Object.keys(data).length === 0 && !dto.settings) {
            return {
                success: true,
                message: 'Нет данных для обновления',
            };
        }

        const result = await this.projectsRepo.update(team.id, project.id, data);

        if (!result) {
            throw new BaseException(
                {
                    code: ProjectErrorCodes.UPDATE_FAILED,
                    message: ProjectErrorMessages[ProjectErrorCodes.UPDATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        // if (dto.settings) {
        //     await this.settingsRepo.update(project.id, dto.settings);
        // }

        return {
            success: result,
            message: result ? 'Настройки проекта успешно обновлены' : 'Изменения не были применены',
        };
    }
}
