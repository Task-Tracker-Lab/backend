import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { ReordersStatesDto } from '../../dtos';
import { IStateRepository } from '@core/area/domain/repository';
import { ProjectStateErrorCodes, ProjectStateErrorMessages } from '@core/area/domain/errors';
import { GetAreaQuery } from '../areas';

@Injectable()
export class ReorderStateUseCase {
    constructor(
        @Inject('IStateRepository')
        private readonly stateRepo: IStateRepository,
        private readonly getAreaQ: GetAreaQuery,
    ) {}

    async execute(slug: string, dto: ReordersStatesDto, userId: string) {
        const area = await this.getAreaQ.execute('projectSlug', slug, userId);

        const state = await this.stateRepo.find(slug);

        if (!state) {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.NOT_FOUND,
                    message: ProjectStateErrorMessages[ProjectStateErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        // TODO: ADD REODER STATES
        (void dto, area);
        const result = true;

        return {
            success: result,
            message: result
                ? 'Состояние успешно восстановлено'
                : 'Не удалось восстановить состояние: запись не найдена или уже активна',
        };
    }
}
