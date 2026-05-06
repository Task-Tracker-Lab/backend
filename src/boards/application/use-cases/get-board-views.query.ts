import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import type { BoardView } from '@core/boards/domain/entities';

@Injectable()
export class GetBoardViewsQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
    ) {}

    public async execute(boardId: string, _userId: string): Promise<BoardView[]> {
        return this.boardsRepo.findViews(boardId);
    }
}
