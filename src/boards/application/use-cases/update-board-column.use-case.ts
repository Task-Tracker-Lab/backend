import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { UpdateBoardColumnDto } from '@core/boards/application/dtos';
import type { BoardColumn } from '@core/boards/domain/entities';

@Injectable()
export class UpdateBoardColumnUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
    ) {}

    public async execute(
        id: string,
        _boardId: string,
        _userId: string,
        dto: UpdateBoardColumnDto,
    ): Promise<BoardColumn | null> {
        return this.boardsRepo.updateColumn(id, dto);
    }
}
