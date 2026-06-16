import { AreaErrorCodes, AreaErrorMessages } from '@core/area/domain/errors';
import { IAreaRepository } from '@core/area/domain/repository';
import { MAX_AREAS_PER_PROJECT } from '@core/area/infrastructure/constants';
import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import slugify from 'slugify';

import { CreateAreaDto } from '../../dtos';

@Injectable()
export class CreateAreaUseCase {
    constructor(
        @Inject('IAreaRepository')
        private readonly areaRepo: IAreaRepository,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, dto: CreateAreaDto, userId: string) {
        try {
            const { project } = await this.projectPolicy.ensureProjectAccess(slug, userId, [
                'admin',
                'owner',
            ]);

            const baseSlug = dto.slug || dto.title;
            const currentSlug = slugify(baseSlug, {
                lower: true,
                strict: true,
                trim: true,
            });

            if (!currentSlug) {
                throw new BaseException(
                    {
                        code: AreaErrorCodes.SLUG_INVALID,
                        message: AreaErrorMessages[AreaErrorCodes.SLUG_INVALID],
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            const existingArea = await this.areaRepo.findBySlug(project.id, currentSlug);

            if (existingArea) {
                throw new BaseException(
                    {
                        code: AreaErrorCodes.SLUG_DUPLICATE,
                        message: AreaErrorMessages[AreaErrorCodes.SLUG_DUPLICATE],
                    },
                    HttpStatus.CONFLICT,
                );
            }

            await this.checkProjectLimits(project.id);

            const result = await this.areaRepo.create({
                ...dto,
                projectId: project.id,
                slug: currentSlug,
                createdBy: userId,
            });

            return {
                success: true,
                message: `Пространство ${dto.title} успешно создано.`,
                slug: result.slug,
            };
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }

            throw new BaseException(
                {
                    code: AreaErrorCodes.CREATE_FAILED,
                    message: AreaErrorMessages[AreaErrorCodes.CREATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async checkProjectLimits(projectId: string): Promise<void> {
        const areasCount = await this.areaRepo.countByProject(projectId);
        if (areasCount >= MAX_AREAS_PER_PROJECT) {
            throw new BaseException(
                {
                    code: AreaErrorCodes.MAX_LIMIT_REACHED,
                    message: AreaErrorMessages[AreaErrorCodes.MAX_LIMIT_REACHED],
                },
                HttpStatus.FORBIDDEN,
            );
        }
    }
}
