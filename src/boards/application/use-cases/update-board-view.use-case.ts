import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { UpdateBoardViewDto } from '@core/boards/application/dtos';
import type { BoardView } from '@core/boards/domain/entities';

@Injectable()
export class UpdateBoardViewUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
    ) {}

    public async execute(
        id: string,
        _boardId: string,
        _userId: string,
        dto: UpdateBoardViewDto,
    ): Promise<BoardView | null> {
        return this.boardsRepo.updateView(id, dto);
    }
}
