import { IAreaRepository } from '@core/area/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UpdateAreaDto } from '../../dtos';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { BaseException } from '@shared/error';
import { AreaErrorCodes, AreaErrorMessages } from '@core/area/domain/errors';
import slugify from 'slugify';

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

            const area = await this.areaRepo.findBySlug(project.id, key);

            if (!area) {
                throw new BaseException(
                    {
                        code: AreaErrorCodes.NOT_FOUND,
                        message: AreaErrorMessages[AreaErrorCodes.NOT_FOUND],
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            // TODO: TMP|fix that at next patch resolve
            const updateData: any = {
                updatedAt: new Date().toISOString(),
                updatedBy: userId,
                ...(dto.title && dto.title !== area.title && { title: dto.title.trim() }),
                ...(dto.description &&
                    dto.description !== area.description && {
                        description: dto.description?.trim() || null,
                    }),
                ...(dto.descriptionHtml &&
                    dto.descriptionHtml !== area.descriptionHtml && {
                        descriptionHtml: dto.descriptionHtml?.trim() || null,
                    }),
                ...(dto.color && dto.color !== area.color && { color: dto.color || null }),
                ...(dto.icon && dto.icon !== area.icon && { icon: dto.icon || null }),
                ...(dto.defaultView &&
                    dto.defaultView !== area.defaultView && { defaultView: dto.defaultView }),
                ...(dto.position &&
                    dto.position !== area.position &&
                    dto.position >= 0 && { position: dto.position }),
                ...(dto.maxTasksLimit &&
                    dto.maxTasksLimit !== area.maxTasksLimit &&
                    dto.maxTasksLimit > 0 && { maxTasksLimit: dto.maxTasksLimit }),
                ...(dto.isLocked && dto.isLocked !== area.isLocked && { isLocked: dto.isLocked }),
            };

            let hasChanges = false;

            if (dto.slug && dto.slug !== area.slug) {
                let newSlug = dto.slug;

                if (newSlug) {
                    newSlug = slugify(newSlug, {
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

                    const existingArea = await this.areaRepo.findBySlug(project.id, newSlug);
                    if (existingArea && existingArea.id !== area.id) {
                        throw new BaseException(
                            {
                                code: AreaErrorCodes.SLUG_DUPLICATE,
                                message: AreaErrorMessages[AreaErrorCodes.SLUG_DUPLICATE],
                            },
                            HttpStatus.CONFLICT,
                        );
                    }

                    updateData.slug = newSlug;
                } else {
                    updateData.slug = slugify(updateData.title || area.title, {
                        lower: true,
                        strict: true,
                        trim: true,
                    });
                }
                hasChanges = true;
            }

            if (!hasChanges) {
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
            if (e instanceof BaseException) throw e;

            throw new BaseException(
                {
                    code: AreaErrorCodes.UPDATE_FAILED,
                    message: AreaErrorMessages[AreaErrorCodes.UPDATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
