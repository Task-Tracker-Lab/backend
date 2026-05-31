import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import type { UpdateBoardViewDto } from '@core/boards/application/dtos';
import { BoardAccessPolicy } from '@core/boards/domain/policy';
import { BaseException } from '@shared/error';

@Injectable()
export class UpdateBoardViewUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(id: string, boardId: string, userId: string, dto: UpdateBoardViewDto) {
        await this.policyAccess.validateViewAccess(id, userId, boardId);

        const result = await this.boardsRepo.updateView(id, dto);

        if (!result) {
            throw new BaseException(
                {
                    code: 'UPDATE_FAILED',
                    message:
                        'Изменения не были применены. Возможно, данные идентичны текущим или представление недоступна',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        return {
            success: true,
            message: 'Представление успешно обновлено',
        };
    }
}
