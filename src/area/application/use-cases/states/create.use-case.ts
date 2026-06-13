import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { IStateRepository } from '@core/area/domain/repository';
import { CreateStateDto } from '../../dtos';
import { ProjectStateErrorCodes, ProjectStateErrorMessages } from '@core/area/domain/errors';
import { GetAreaQuery } from '../areas';

const MAX_STATES_PER_PROJECT = 20;

@Injectable()
export class CreateStateUseCase {
    constructor(
        @Inject('IStateRepository')
        private readonly stateRepo: IStateRepository,
        private readonly getAreaQ: GetAreaQuery,
    ) {}

    async execute(slug: string, dto: CreateStateDto, userId: string) {
        const area = await this.getAreaQ.execute('projectSlug', slug, userId);

        const currentCount = await this.stateRepo.countByArea(area.id);
        if (currentCount >= MAX_STATES_PER_PROJECT) {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.MAX_LIMIT_REACHED,
                    message: ProjectStateErrorMessages[ProjectStateErrorCodes.MAX_LIMIT_REACHED],
                    details: [{ current: currentCount, max: MAX_STATES_PER_PROJECT }],
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        if (dto.title) {
            const existingByTitle = await this.stateRepo.findByTitle(area.id, dto.title);

            if (existingByTitle) {
                throw new BaseException(
                    {
                        code: ProjectStateErrorCodes.DUPLICATE_TITLE,
                        message: ProjectStateErrorMessages[ProjectStateErrorCodes.DUPLICATE_TITLE],
                        details: [{ title: dto.title }],
                    },
                    HttpStatus.CONFLICT,
                );
            }
        }

        if (dto.stateType && dto.stateType !== 'custom') {
            const existingByType = await this.stateRepo.findByType(area.id, dto.stateType);

            if (existingByType) {
                throw new BaseException(
                    {
                        code: ProjectStateErrorCodes.DUPLICATE_TYPE,
                        message: ProjectStateErrorMessages[ProjectStateErrorCodes.DUPLICATE_TYPE],
                        details: [{ stateType: dto.stateType }],
                    },
                    HttpStatus.CONFLICT,
                );
            }
        }

        const result = await this.stateRepo.create({
            ...dto,
            areaId: area.id,
            createdBy: userId,
        });

        return {
            success: true,
            message: 'Состояние успешно создано',
            stateId: result.id,
        };
    }
}
