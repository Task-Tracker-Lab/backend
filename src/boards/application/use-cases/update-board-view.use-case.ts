import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { UpdateBoardViewDto } from '@core/boards/application/dtos';
import type { BoardView } from '@core/boards/domain/entities';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class UpdateBoardViewUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(
        id: string,
        boardId: string,
        userId: string,
        dto: UpdateBoardViewDto,
    ): Promise<BoardView | null> {
        await this.boardAccess.validateViewAccess(id, userId, boardId);

        return this.boardsRepo.updateView(id, dto);
    }
}
