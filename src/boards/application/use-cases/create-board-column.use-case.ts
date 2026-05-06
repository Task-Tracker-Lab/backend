import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { CreateBoardColumnDto } from '@core/boards/application/dtos';
import type { BoardColumn } from '@core/boards/domain/entities';

@Injectable()
export class CreateBoardColumnUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
    ) {}

    public async execute(
        boardId: string,
        _userId: string,
        dto: CreateBoardColumnDto,
    ): Promise<BoardColumn> {
        return this.boardsRepo.createColumn({ boardId, ...dto });
    }
}
