import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { UpdateBoardDto } from '@core/boards/application/dtos';
import type { BoardWithRelations } from '@core/boards/domain/entities';

@Injectable()
export class UpdateBoardUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
    ) {}

    public async execute(
        id: string,
        _projectId: string,
        _userId: string,
        dto: UpdateBoardDto,
    ): Promise<BoardWithRelations | null> {
        return await this.boardsRepo.update(id, dto);
    }
}
