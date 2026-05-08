import { Inject, Injectable } from '@nestjs/common';
import type { BoardWithRelations } from '@core/boards/domain/entities';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class GetBoardQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(
        id: string,
        projectId: string,
        userId: string,
    ): Promise<BoardWithRelations | null> {
        await this.boardAccess.validateBoardAccess(id, userId, projectId);

        return this.boardsRepo.findOne(id);
    }
}
