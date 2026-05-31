import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import { BoardAccessPolicy } from '@core/boards/domain/policy';
import { BaseException } from '@shared/error';

@Injectable()
export class DeleteBoardColumnUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(id: string, boardId: string, userId: string) {
        await this.policyAccess.validateColumnAccess(id, userId, boardId);

        const result = await this.boardsRepo.removeColumn(id);

        if (!result) {
            throw new BaseException(
                {
                    code: 'DELETE_FAILED',
                    message: 'Не удалось удалить колонку доски',
                },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        return {
            success: true,
            message: `Колонка доски успешно удалена`,
        };
    }
}
