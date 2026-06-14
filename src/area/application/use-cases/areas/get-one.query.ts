import { AreaErrorCodes, AreaErrorMessages } from '@core/area/domain/errors';
import { IAreaRepository } from '@core/area/domain/repository';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

export type GetOneAreaParams = { projectSlug: string; key: string } | { key: string };

@Injectable()
export class GetAreaQuery {
    constructor(
        @Inject('IAreaRepository')
        private readonly areaRepo: IAreaRepository,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(params: GetOneAreaParams, userId: string) {
        if ('projectSlug' in params) {
            return this.getAreaByProjectSlug(params.projectSlug, params.key, userId);
        }

        return this.getAreaByKey(params.key);
    }

    private async getAreaByProjectSlug(slug: string, key: string, userId: string) {
        const { project } = await this.projectPolicy.ensureProjectAccess(slug, userId);

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

        return {
            ...area,
            createdAt: new Date(area.createdAt).toISOString(),
            updatedAt: new Date(area.updatedAt).toISOString(),
        };
    }

    private async getAreaByKey(key: string) {
        const area = await this.areaRepo.findBySlug(key);

        if (!area) {
            throw new BaseException(
                {
                    code: AreaErrorCodes.NOT_FOUND,
                    message: AreaErrorMessages[AreaErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return area;
    }
}
