import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import type { BoardWithRelations } from '@core/boards/domain/entities';

@Injectable()
export class GetBoardsQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
    ) {}

    public async execute(projectId: string, _userId: string): Promise<BoardWithRelations[]> {
        return this.boardsRepo.findAll(projectId);
    }
}
