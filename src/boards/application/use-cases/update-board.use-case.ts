import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import type { UpdateBoardDto } from '@core/boards/application/dtos';
import { BoardAccessPolicy } from '@core/boards/domain/policy';
import { BaseException } from '@shared/error';

@Injectable()
export class UpdateBoardUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(id: string, projectId: string, userId: string, dto: UpdateBoardDto) {
        await this.policyAccess.validateBoardAccess(id, userId, projectId);

        const result = await this.boardsRepo.update(id, dto);

        if (!result) {
            throw new BaseException(
                {
                    code: 'UPDATE_FAILED',
                    message:
                        'Изменения не были применены. Возможно, данные идентичны текущим или доска недоступна',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        return {
            success: true,
            message: 'Доска успешно обновлена',
        };
    }
}
