import { CreateBoardUseCase } from './create-board.use-case';
import { UpdateBoardUseCase } from './update-board.use-case';
import { DeleteBoardUseCase } from './delete-board.use-case';
import { GetBoardQuery } from './get-board.query';
import { GetBoardsQuery } from './get-boards.query';
import { CreateBoardColumnUseCase } from './create-board-column.use-case';
import { UpdateBoardColumnUseCase } from './update-board-column.use-case';
import { DeleteBoardColumnUseCase } from './delete-board-column.use-case';
import { GetBoardColumnsQuery } from './get-board-columns.query';
import { GetBoardColumnQuery } from './get-board-column.query';

export * from './create-board.use-case';
export * from './update-board.use-case';
export * from './delete-board.use-case';
export * from './get-board.query';
export * from './get-boards.query';
export * from './create-board-column.use-case';
export * from './update-board-column.use-case';
export * from './delete-board-column.use-case';
export * from './get-board-columns.query';
export * from './get-board-column.query';

export const BoardUseCases = [
    CreateBoardUseCase,
    UpdateBoardUseCase,
    DeleteBoardUseCase,
    CreateBoardColumnUseCase,
    UpdateBoardColumnUseCase,
    DeleteBoardColumnUseCase,
];
export const BoardQueries = [
    GetBoardQuery,
    GetBoardsQuery,
    GetBoardColumnsQuery,
    GetBoardColumnQuery,
];
