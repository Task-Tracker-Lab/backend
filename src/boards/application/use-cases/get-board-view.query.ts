import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import type { BoardView } from '@core/boards/domain/entities';

@Injectable()
export class GetBoardViewQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
    ) {}

    public async execute(id: string, _boardId: string, _userId: string): Promise<BoardView | null> {
        return this.boardsRepo.findViewById(id);
    }
}
