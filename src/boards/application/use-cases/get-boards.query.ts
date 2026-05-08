import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import type { BoardWithRelations } from '@core/boards/domain/entities';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class GetBoardsQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(projectId: string, userId: string): Promise<BoardWithRelations[]> {
        await this.boardAccess.validateProjectAccess(projectId, userId);

        return this.boardsRepo.findAll(projectId);
    }
}
