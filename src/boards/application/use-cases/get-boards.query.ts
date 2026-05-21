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

        const items = await this.boardsRepo.findAll(projectId);

        return {
            // TODO: реализовать полноценную пагинацию для досок проекта.
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
