import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import { BoardAccessPolicy } from '@core/boards/domain/policy';
import { BaseException } from '@shared/error';

@Injectable()
export class DeleteBoardUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(id: string, projectId: string, userId: string) {
        await this.policyAccess.validateBoardAccess(id, userId, projectId);

        const result = await this.boardsRepo.remove(id);

        if (!result) {
            throw new BaseException(
                {
                    code: 'DELETE_FAILED',
                    message: 'Не удалось удалить доску',
                },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        return {
            success: true,
            message: `Доска успешно удалена`,
        };
    }
}
