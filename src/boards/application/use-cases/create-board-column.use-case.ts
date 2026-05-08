import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { CreateBoardColumnDto } from '@core/boards/application/dtos';
import type { BoardColumn } from '@core/boards/domain/entities';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class CreateBoardColumnUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(
        boardId: string,
        userId: string,
        dto: CreateBoardColumnDto,
    ): Promise<BoardColumn> {
        await this.boardAccess.validateBoardAccess(boardId, userId);

        return this.boardsRepo.createColumn({ boardId, ...dto });
    }
}
