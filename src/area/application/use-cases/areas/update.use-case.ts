import { AreaErrorCodes, AreaErrorMessages } from '@core/area/domain/errors';
import { IAreaRepository } from '@core/area/domain/repository';
import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import slugify from 'slugify';

import { UpdateAreaDto } from '../../dtos';

import type { Area } from '../../../domain/entities';

@Injectable()
export class UpdateAreaUseCase {
    constructor(
        @Inject('IAreaRepository')
        private readonly areaRepo: IAreaRepository,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, key: string, dto: UpdateAreaDto, userId: string) {
        try {
            const { project } = await this.projectPolicy.ensureProjectAccess(slug, userId, [
                'admin',
                'owner',
            ]);

            const area = await this.areaRepo.findBySlug(key, project.id);

            if (!area) {
                throw new BaseException(
                    {
                        code: AreaErrorCodes.NOT_FOUND,
                        message: AreaErrorMessages[AreaErrorCodes.NOT_FOUND],
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            const updateData = this.buildUpdateData(area, dto);

            if (dto.slug && dto.slug !== area.slug) {
                await this.updateSlug(project.id, area, dto.slug, updateData);
            }

            if (Object.keys(updateData).length === 0) {
                return {
                    success: true,
                    message: 'Нет изменений для обновления',
                };
            }

            const result = await this.areaRepo.update(project.id, area.id, updateData);

            return {
                success: result,
                message: `Пространство ${dto.title || area.title} успешно обновлено`,
            };
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }

            throw new BaseException(
                {
                    code: AreaErrorCodes.UPDATE_FAILED,
                    message: AreaErrorMessages[AreaErrorCodes.UPDATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private buildUpdateData(area: Area, dto: UpdateAreaDto): Partial<Area> {
        const updateData: Partial<Area> = {};

        if (dto.title !== undefined && dto.title !== area.title) {
            updateData.title = dto.title.trim();
        }

        if (dto.description !== undefined && dto.description !== area.description) {
            updateData.description = dto.description?.trim() ?? null;
        }

        if (dto.descriptionHtml !== undefined && dto.descriptionHtml !== area.descriptionHtml) {
            updateData.descriptionHtml = dto.descriptionHtml?.trim() ?? null;
        }

        if (dto.color !== undefined && dto.color !== area.color) {
            updateData.color = dto.color ?? null;
        }

        if (dto.icon !== undefined && dto.icon !== area.icon) {
            updateData.icon = dto.icon ?? null;
        }

        if (dto.defaultView !== undefined && dto.defaultView !== area.defaultView) {
            updateData.defaultView = dto.defaultView;
        }

        if (dto.position !== undefined && dto.position !== area.position && dto.position >= 0) {
            updateData.position = dto.position;
        }

        if (
            dto.maxTasksLimit &&
            dto.maxTasksLimit !== area.maxTasksLimit &&
            dto.maxTasksLimit > 0
        ) {
            updateData.maxTasksLimit = dto.maxTasksLimit;
        }

        if (dto.isLocked !== undefined && dto.isLocked !== area.isLocked) {
            updateData.isLocked = dto.isLocked;
        }

        return updateData;
    }

    private async updateSlug(
        projectId: string,
        area: Area,
        slug: string,
        updateData: Partial<Area>,
    ): Promise<void> {
        const newSlug = slugify(slug, {
            lower: true,
            strict: true,
            trim: true,
        });

        if (!newSlug) {
            throw new BaseException(
                {
                    code: AreaErrorCodes.SLUG_INVALID,
                    message: AreaErrorMessages[AreaErrorCodes.SLUG_INVALID],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const existingArea = await this.areaRepo.findBySlug(projectId, slug);
        if (existingArea && existingArea.id !== area.id) {
            throw new BaseException(
                {
                    code: AreaErrorCodes.SLUG_DUPLICATE,
                    message: AreaErrorMessages[AreaErrorCodes.SLUG_DUPLICATE],
                },
                HttpStatus.CONFLICT,
            );
        }

        updateData.slug = slug;
    }
}
