import { Inject, Injectable } from '@nestjs/common';
import type { BoardColumn } from '@core/boards/domain/entities';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class GetBoardColumnQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(id: string, boardId: string, userId: string): Promise<BoardColumn | null> {
        await this.boardAccess.validateColumnAccess(id, userId, boardId);

        return this.boardsRepo.findColumnById(id);
    }
}
