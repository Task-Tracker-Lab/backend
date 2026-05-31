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
import { CreateBoardViewUseCase } from './create-board-view.use-case';
import { UpdateBoardViewUseCase } from './update-board-view.use-case';
import { DeleteBoardViewUseCase } from './delete-board-view.use-case';
import { GetBoardViewsQuery } from './get-board-views.query';
import { GetBoardViewQuery } from './get-board-view.query';

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
export * from './create-board-view.use-case';
export * from './update-board-view.use-case';
export * from './delete-board-view.use-case';
export * from './get-board-views.query';
export * from './get-board-view.query';

export const BoardUseCases = [
    CreateBoardUseCase,
    UpdateBoardUseCase,
    DeleteBoardUseCase,
    CreateBoardColumnUseCase,
    UpdateBoardColumnUseCase,
    DeleteBoardColumnUseCase,
    CreateBoardViewUseCase,
    UpdateBoardViewUseCase,
    DeleteBoardViewUseCase,
];
export const BoardQueries = [
    GetBoardQuery,
    GetBoardsQuery,
    GetBoardColumnsQuery,
    GetBoardColumnQuery,
    GetBoardViewsQuery,
    GetBoardViewQuery,
];
