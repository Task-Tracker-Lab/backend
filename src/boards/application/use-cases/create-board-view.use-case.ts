import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { CreateBoardViewDto } from '@core/boards/application/dtos';
import type { BoardView } from '@core/boards/domain/entities';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class CreateBoardViewUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(
        boardId: string,
        userId: string,
        dto: CreateBoardViewDto,
    ): Promise<BoardView> {
        await this.boardAccess.validateBoardAccess(boardId, userId);

        return this.boardsRepo.createView({ boardId, ...dto });
    }
}
