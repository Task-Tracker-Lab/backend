import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import { BoardAccessPolicy } from '@core/boards/domain/policy';
import { BaseException } from '@shared/error';

@Injectable()
export class GetBoardQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(id: string, projectId: string, userId: string) {
        await this.policyAccess.validateBoardAccess(id, userId, projectId);

        const result = await this.boardsRepo.findOne(id);

        if (!result) {
            throw new BaseException(
                { code: 'NOT_FOUND', message: 'Не удалось найти доску' },
                HttpStatus.NOT_FOUND,
            );
        }

        return result;
    }
}
