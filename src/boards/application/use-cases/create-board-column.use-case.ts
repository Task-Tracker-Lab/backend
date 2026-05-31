import { Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import type { CreateBoardColumnDto } from '@core/boards/application/dtos';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class CreateBoardColumnUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(boardId: string, userId: string, dto: CreateBoardColumnDto) {
        await this.policyAccess.validateBoardAccess(boardId, userId);

        const created = await this.boardsRepo.createColumn({ boardId, ...dto });

        return {
            success: true,
            message: 'Колонка создана',
            columnId: created.id,
        };
    }
}
