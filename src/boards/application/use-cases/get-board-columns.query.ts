import { Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class GetBoardColumnsQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(boardId: string, userId: string) {
        await this.policyAccess.validateBoardAccess(boardId, userId);

        const items = await this.boardsRepo.findColumns(boardId);

        return {
            // TODO: реализовать полноценную пагинацию для колонок доски.
            items,
            meta: {
                total: items.length,
                totalPages: items.length ? 1 : 0,
                page: 1,
                limit: 10,
                hasPrevPage: false,
                hasNextPage: false,
            },
        };
    }
}
