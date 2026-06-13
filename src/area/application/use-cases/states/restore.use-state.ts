import { ProjectStateErrorCodes, ProjectStateErrorMessages } from '@core/area/domain/errors';
import { IStateRepository } from '@core/area/domain/repository';
import { FindProjectQuery } from '@core/projects';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class RestoreStateUseCase {
    constructor(
        @Inject('IStateRepository')
        private readonly stateRepo: IStateRepository,
        private readonly findProjectQ: FindProjectQuery,
    ) {}

    async execute(slug: string, stateId: string, userId: string) {
        const { project } = await this.findProjectQ.execute(slug, 'teamId??', 'admin', userId);

        const state = await this.stateRepo.findOne(slug, stateId, true);

        if (!state) {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.NOT_FOUND,
                    message: ProjectStateErrorMessages[ProjectStateErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const result = await this.stateRepo.update(project.id, stateId, {
            deletedAt: null,
        });

        return {
            success: result,
            message: result
                ? 'Состояние успешно восстановлено'
                : 'Не удалось восстановить состояние: запись не найдена или уже активна',
        };
    }
}
