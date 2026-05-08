import { Inject, Injectable } from '@nestjs/common';
import type { BoardView } from '@core/boards/domain/entities';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class GetBoardViewQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(id: string, boardId: string, userId: string): Promise<BoardView | null> {
        await this.boardAccess.validateViewAccess(id, userId, boardId);

        return this.boardsRepo.findViewById(id);
    }
}
