import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { IStateRepository } from '@core/area/domain/repository';
import { UpdateStateDto } from '../../dtos';
import { FindProjectQuery } from '@core/projects';
import { ProjectStateErrorCodes, ProjectStateErrorMessages } from '@core/area/domain/errors';

@Injectable()
export class UpdateStateUseCase {
    constructor(
        @Inject('IStateRepository')
        private readonly stateRepo: IStateRepository,
        private readonly findProjectQ: FindProjectQuery,
    ) {}

    async execute(slug: string, stateId: string, dto: UpdateStateDto, userId: string) {
        await this.findProjectQ.execute(slug, 'teamId??', 'admin', userId);

        const state = await this.stateRepo.findOne(slug, stateId);

        if (!state) {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.NOT_FOUND,
                    message: ProjectStateErrorMessages[ProjectStateErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (state.isLocked) {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.LOCKED,
                    message: ProjectStateErrorMessages[ProjectStateErrorCodes.LOCKED],
                },
                HttpStatus.CONFLICT,
            );
        }

        if (state.stateType !== 'custom' && dto.stateType === 'custom') {
            throw new BaseException(
                {
                    code: ProjectStateErrorCodes.SYSTEM_TYPE_IMMUTABLE,
                    message:
                        ProjectStateErrorMessages[ProjectStateErrorCodes.SYSTEM_TYPE_IMMUTABLE],
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const result = await this.stateRepo.update(slug, stateId, dto);

        return {
            success: result,
            message: result
                ? 'Состояние успешно обновлено'
                : 'Не удалось обновить состояние: запись не найдена',
        };
    }
}
