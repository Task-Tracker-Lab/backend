import { Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import type { CreateBoardDto } from '@core/boards/application/dtos';
import { BoardFactory } from '@core/boards/domain/factories/board.factory';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class CreateBoardUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(projectId: string, userId: string, dto: CreateBoardDto) {
        await this.policyAccess.validateProjectAccess(projectId, userId);

        const { board, columns, views } = BoardFactory.createBoard(projectId, userId, dto);

        const created = await this.boardsRepo.create(board, columns, views);

        return {
            success: true,
            message: 'Доска успешно создана',
            boardId: created.id,
        };
    }
}
