import {
    Board,
    BoardColumn,
    BoardWithRelations,
    NewBoard,
    NewBoardColumn,
    NewBoardView,
} from '@core/boards/domain/entities';

export interface IBoardsRepository {
    findAll(projectId: string): Promise<BoardWithRelations[]>;
    findById(id: string): Promise<BoardWithRelations | null>;
    create(
        board: NewBoard,
        columns: NewBoardColumn[],
        views: NewBoardView[],
    ): Promise<BoardWithRelations>;
    update(id: string, data: Partial<Board>): Promise<BoardWithRelations | null>;
    remove(id: string): Promise<boolean>;
    findColumns(boardId: string): Promise<BoardColumn[]>;
    findColumnById(id: string): Promise<BoardColumn | null>;
    createColumn(column: NewBoardColumn): Promise<BoardColumn>;
    updateColumn(id: string, data: Partial<BoardColumn>): Promise<BoardColumn | null>;
    removeColumn(id: string): Promise<boolean>;
}
