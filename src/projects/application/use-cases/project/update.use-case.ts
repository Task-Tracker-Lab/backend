import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { UpdateProjectDto } from '../../dtos';
import { BaseException } from '@shared/error';
import { IProjectRepository } from '@core/projects/domain/repository';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { ProjectErrorCodes, ProjectErrorMessages } from '@core/projects/domain/errors';
import slugify from 'slugify';

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

        const data: Record<string, unknown> = {};

        if (dto.slug) data['slug'] = slugify(dto.slug, { lower: true, strict: true });
        if (dto.name) data['name'] = dto.name.trim();
        if (dto.description !== undefined) data['description'] = dto.description?.trim() || null;
        if (dto.descriptionHtml !== undefined) {
            data['descriptionHtml'] = dto.descriptionHtml?.trim() || null;
        }
        if (dto.icon !== undefined) data['icon'] = dto.icon || null;
        if (dto.color !== undefined) data['color'] = dto.color || null;
        if (dto.sequence !== undefined) data['sequence'] = dto.sequence;
        if (dto.visibility) data['visibility'] = dto.visibility;

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

        if (!result) {
            throw new BaseException(
                {
                    code: 'UPDATE_FAILED',
                    message:
                        'Изменения не были применены. Возможно, данные идентичны текущим или проект недоступен',
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
