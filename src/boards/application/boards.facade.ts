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
    CreateBoardViewUseCase,
    UpdateBoardViewUseCase,
    DeleteBoardViewUseCase,
    GetBoardViewsQuery,
    GetBoardViewQuery,
} from './use-cases';
import {
    CreateBoardDto,
    CreateBoardColumnDto,
    CreateBoardColumnResponse,
    CreateBoardViewDto,
    CreateBoardViewResponse,
    CreateBoardResponse,
    UpdateBoardColumnDto,
    UpdateBoardDto,
    UpdateBoardViewDto,
} from './dtos';
import type { BoardColumn, BoardView, BoardWithRelations } from '@core/boards/domain/entities';
import type { ActionResponse } from '@shared/dtos';

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

        private readonly createBoardViewUC: CreateBoardViewUseCase,
        private readonly updateBoardViewUC: UpdateBoardViewUseCase,
        private readonly deleteBoardViewUC: DeleteBoardViewUseCase,
        private readonly getBoardViewsQ: GetBoardViewsQuery,
        private readonly getBoardViewQ: GetBoardViewQuery,
    ) {}

    public async create(
        projectId: string,
        userId: string,
        dto: CreateBoardDto,
    ): Promise<CreateBoardResponse> {
        return this.createBoardUC.execute(projectId, userId, dto);
    }

    public async update(
        id: string,
        projectId: string,
        userId: string,
        dto: UpdateBoardDto,
    ): Promise<ActionResponse> {
        return this.updateBoardUC.execute(id, projectId, userId, dto);
    }

    public async delete(id: string, projectId: string, userId: string): Promise<ActionResponse> {
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
    ): Promise<CreateBoardColumnResponse> {
        return this.createBoardColumnUC.execute(boardId, userId, dto);
    }

    public async updateColumn(
        id: string,
        boardId: string,
        userId: string,
        dto: UpdateBoardColumnDto,
    ): Promise<ActionResponse> {
        return this.updateBoardColumnUC.execute(id, boardId, userId, dto);
    }

    public async deleteColumn(
        id: string,
        boardId: string,
        userId: string,
    ): Promise<ActionResponse> {
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

    public async createView(
        boardId: string,
        userId: string,
        dto: CreateBoardViewDto,
    ): Promise<CreateBoardViewResponse> {
        return this.createBoardViewUC.execute(boardId, userId, dto);
    }

    public async updateView(
        id: string,
        boardId: string,
        userId: string,
        dto: UpdateBoardViewDto,
    ): Promise<ActionResponse> {
        return this.updateBoardViewUC.execute(id, boardId, userId, dto);
    }

    public async deleteView(id: string, boardId: string, userId: string): Promise<ActionResponse> {
        return this.deleteBoardViewUC.execute(id, boardId, userId);
    }

    public async getView(id: string, boardId: string, userId: string): Promise<BoardView | null> {
        return this.getBoardViewQ.execute(id, boardId, userId);
    }

    public async getViews(boardId: string, userId: string): Promise<BoardView[]> {
        return this.getBoardViewsQ.execute(boardId, userId);
    }
}
