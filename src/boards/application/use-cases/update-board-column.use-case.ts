import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import type { UpdateBoardColumnDto } from '@core/boards/application/dtos';
import { BoardAccessPolicy } from '@core/boards/domain/policy';
import { BaseException } from '@shared/error';

@Injectable()
export class UpdateBoardColumnUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(id: string, boardId: string, userId: string, dto: UpdateBoardColumnDto) {
        await this.policyAccess.validateColumnAccess(id, userId, boardId);

        const result = await this.boardsRepo.updateColumn(id, dto);

        if (!result) {
            throw new BaseException(
                {
                    code: 'UPDATE_FAILED',
                    message:
                        'Изменения не были применены. Возможно, данные идентичны текущим или колонка недоступна',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        return {
            success: true,
            message: 'Колонка успешно обновлена',
        };
    }
}
