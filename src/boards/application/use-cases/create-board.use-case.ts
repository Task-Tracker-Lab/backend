import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { CreateBoardDto } from '@core/boards/application/dtos';
import { BoardFactory } from '@core/boards/domain/factories/board.factory';
import type { BoardWithRelations } from '@core/boards/domain/entities';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class CreateBoardUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(
        projectId: string,
        userId: string,
        dto: CreateBoardDto,
    ): Promise<BoardWithRelations> {
        await this.boardAccess.validateProjectAccess(projectId, userId);

        const { board, columns, views } = BoardFactory.createBoard(projectId, userId, dto);

        return this.boardsRepo.create(board, columns, views);
    }
}
