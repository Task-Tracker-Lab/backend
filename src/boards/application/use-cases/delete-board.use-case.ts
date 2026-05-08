import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class DeleteBoardUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(id: string, projectId: string, userId: string): Promise<boolean> {
        await this.boardAccess.validateBoardAccess(id, userId, projectId);

        return this.boardsRepo.remove(id);
    }
}
