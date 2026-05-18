import { Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class GetBoardsQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(projectId: string, userId: string) {
        await this.policyAccess.validateProjectAccess(projectId, userId);

        return this.boardsRepo.findAll(projectId);
    }
}
