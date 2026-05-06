import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import type { BoardColumn } from '@core/boards/domain/entities';

@Injectable()
export class GetBoardColumnsQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
    ) {}

    public async execute(boardId: string, _userId: string): Promise<BoardColumn[]> {
        return this.boardsRepo.findColumns(boardId);
    }
}
