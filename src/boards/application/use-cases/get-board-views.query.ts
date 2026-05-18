import { Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import type { BoardView } from '@core/boards/domain/entities';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class GetBoardViewsQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(boardId: string, userId: string): Promise<BoardView[]> {
        await this.policyAccess.validateBoardAccess(boardId, userId);

        return this.boardsRepo.findViews(boardId);
    }
}
