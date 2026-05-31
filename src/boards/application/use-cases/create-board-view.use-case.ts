import { Inject, Injectable } from '@nestjs/common';
import type { IBoardsRepository } from '@core/boards/domain/repository';
import type { CreateBoardViewDto } from '@core/boards/application/dtos';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class CreateBoardViewUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly policyAccess: BoardAccessPolicy,
    ) {}

    public async execute(boardId: string, userId: string, dto: CreateBoardViewDto) {
        await this.policyAccess.validateBoardAccess(boardId, userId);

        const created = await this.boardsRepo.createView({ boardId, ...dto });

        return {
            success: true,
            message: 'Представление создано',
            viewId: created.id,
        };
    }
}
