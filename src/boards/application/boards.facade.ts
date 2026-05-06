import { Injectable } from '@nestjs/common';
import {
    CreateBoardUseCase,
    DeleteBoardUseCase,
    GetBoardQuery,
    GetBoardsQuery,
    UpdateBoardUseCase,
} from './use-cases';
import { CreateBoardDto, UpdateBoardDto } from './dtos';
import type { BoardWithRelations } from '@core/boards/domain/entities';

@Injectable()
export class BoardsFacade {
    constructor(
        private readonly createBoardUC: CreateBoardUseCase,
        private readonly updateBoardUC: UpdateBoardUseCase,
        private readonly deleteBoardUC: DeleteBoardUseCase,
        private readonly getBoardQ: GetBoardQuery,
        private readonly getBoardsQ: GetBoardsQuery,
    ) {}

    public async create(
        projectId: string,
        userId: string,
        dto: CreateBoardDto,
    ): Promise<BoardWithRelations> {
        return this.createBoardUC.execute(projectId, userId, dto);
    }

    public async update(
        id: string,
        projectId: string,
        userId: string,
        dto: UpdateBoardDto,
    ): Promise<BoardWithRelations | null> {
        return this.updateBoardUC.execute(id, projectId, userId, dto);
    }

    public async delete(id: string, projectId: string, userId: string): Promise<boolean> {
        return this.deleteBoardUC.execute(id, projectId, userId);
    }

    public async getOne(
        id: string,
        projectId: string,
        userId: string,
    ): Promise<BoardWithRelations | null> {
        return this.getBoardQ.execute(id, projectId, userId);
    }

    public async getAll(projectId: string, userId: string): Promise<BoardWithRelations[]> {
        return this.getBoardsQ.execute(projectId, userId);
    }
}
