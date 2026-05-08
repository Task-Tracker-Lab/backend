import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class DeleteBoardColumnUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(id: string, boardId: string, userId: string): Promise<boolean> {
        await this.boardAccess.validateColumnAccess(id, userId, boardId);

        return this.boardsRepo.removeColumn(id);
    }
}
