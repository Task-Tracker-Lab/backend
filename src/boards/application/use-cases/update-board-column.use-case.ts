import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { UpdateBoardColumnDto } from '@core/boards/application/dtos';
import type { BoardColumn } from '@core/boards/domain/entities';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class UpdateBoardColumnUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(
        id: string,
        boardId: string,
        userId: string,
        dto: UpdateBoardColumnDto,
    ): Promise<BoardColumn | null> {
        await this.boardAccess.validateColumnAccess(id, userId, boardId);

        return this.boardsRepo.updateColumn(id, dto);
    }
}
