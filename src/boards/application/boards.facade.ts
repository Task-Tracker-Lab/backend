import { Injectable } from '@nestjs/common';
import {
    CreateBoardUseCase,
    DeleteBoardUseCase,
    GetBoardQuery,
    GetBoardsQuery,
    UpdateBoardUseCase,
    CreateBoardColumnUseCase,
    UpdateBoardColumnUseCase,
    DeleteBoardColumnUseCase,
    GetBoardColumnsQuery,
    GetBoardColumnQuery,
} from './use-cases';
import { CreateBoardDto, CreateBoardColumnDto, UpdateBoardColumnDto, UpdateBoardDto } from './dtos';
import type { BoardColumn, BoardWithRelations } from '@core/boards/domain/entities';

@Injectable()
export class BoardsFacade {
    constructor(
        private readonly createBoardUC: CreateBoardUseCase,
        private readonly updateBoardUC: UpdateBoardUseCase,
        private readonly deleteBoardUC: DeleteBoardUseCase,
        private readonly getBoardQ: GetBoardQuery,
        private readonly getBoardsQ: GetBoardsQuery,

        private readonly createBoardColumnUC: CreateBoardColumnUseCase,
        private readonly updateBoardColumnUC: UpdateBoardColumnUseCase,
        private readonly deleteBoardColumnUC: DeleteBoardColumnUseCase,
        private readonly getBoardColumnsQ: GetBoardColumnsQuery,
        private readonly getBoardColumnQ: GetBoardColumnQuery,
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

    public async createColumn(
        boardId: string,
        userId: string,
        dto: CreateBoardColumnDto,
    ): Promise<BoardColumn> {
        return this.createBoardColumnUC.execute(boardId, userId, dto);
    }

    public async updateColumn(
        id: string,
        boardId: string,
        userId: string,
        dto: UpdateBoardColumnDto,
    ): Promise<BoardColumn | null> {
        return this.updateBoardColumnUC.execute(id, boardId, userId, dto);
    }

    public async deleteColumn(id: string, boardId: string, userId: string): Promise<boolean> {
        return this.deleteBoardColumnUC.execute(id, boardId, userId);
    }

    public async getColumn(
        id: string,
        boardId: string,
        userId: string,
    ): Promise<BoardColumn | null> {
        return this.getBoardColumnQ.execute(id, boardId, userId);
    }

    public async getColumns(boardId: string, userId: string): Promise<BoardColumn[]> {
        return this.getBoardColumnsQ.execute(boardId, userId);
    }
}
