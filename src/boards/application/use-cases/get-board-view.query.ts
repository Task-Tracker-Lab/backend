import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import { BoardAccessPolicy } from '@core/boards/domain/policy';
import { BaseException } from '@shared/error';

@Injectable()
export class GetBoardViewQuery {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(id: string, boardId: string, userId: string) {
        await this.policyAccess.validateViewAccess(id, userId, boardId);

        const result = await this.boardsRepo.findViewById(id);

        if (!result) {
            throw new BaseException(
                { code: 'NOT_FOUND', message: 'Не удалось найти представление доски' },
                HttpStatus.NOT_FOUND,
            );
        }

        return result;
    }
}
