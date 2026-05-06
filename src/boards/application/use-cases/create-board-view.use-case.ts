import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { CreateBoardViewDto } from '@core/boards/application/dtos';
import type { BoardView } from '@core/boards/domain/entities';

@Injectable()
export class CreateBoardViewUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
    ) {}

    public async execute(
        boardId: string,
        _userId: string,
        dto: CreateBoardViewDto,
    ): Promise<BoardView> {
        return this.boardsRepo.createView({ boardId, ...dto });
    }
}
