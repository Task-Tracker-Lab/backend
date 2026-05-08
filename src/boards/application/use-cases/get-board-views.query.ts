import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import type { BoardView } from '@core/boards/domain/entities';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class GetBoardViewsQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(boardId: string, userId: string): Promise<BoardView[]> {
        await this.boardAccess.validateBoardAccess(boardId, userId);

        return this.boardsRepo.findViews(boardId);
    }
}
