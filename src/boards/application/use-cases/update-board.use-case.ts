import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { UpdateBoardDto } from '@core/boards/application/dtos';
import type { BoardWithRelations } from '@core/boards/domain/entities';
import { BoardAccessPolicy } from '@core/boards/domain/policy';

@Injectable()
export class UpdateBoardUseCase {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly boardAccess: BoardAccessPolicy,
    ) {}

    public async execute(
        id: string,
        projectId: string,
        userId: string,
        dto: UpdateBoardDto,
    ): Promise<BoardWithRelations | null> {
        await this.boardAccess.validateBoardAccess(id, userId, projectId);

        return this.boardsRepo.update(id, dto);
    }
}
