import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import type { BoardColumn } from '@core/boards/domain/entities';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class GetBoardColumnsQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(boardId: string, userId: string): Promise<BoardColumn[]> {
        await this.boardAccess.validateBoardAccess(boardId, userId);

        return this.boardsRepo.findColumns(boardId);
    }
}
