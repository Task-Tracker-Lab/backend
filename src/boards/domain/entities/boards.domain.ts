import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
    boards,
    boardViews,
    boardTypeEnum,
    boardColumns,
} from '@core/boards/infrastructure/persistence/models/boards.model';

export type BoardType = (typeof boardTypeEnum.enumValues)[number];

export type Board = InferSelectModel<typeof boards>;
export type NewBoard = InferInsertModel<typeof boards>;

export type BoardColumn = InferSelectModel<typeof boardColumns>;
export type NewBoardColumn = InferInsertModel<typeof boardColumns>;

export type BoardView = InferSelectModel<typeof boardViews>;
export type NewBoardView = InferInsertModel<typeof boardViews>;

export type BoardWithRelations = Board & {
    boardColumns: BoardColumn[];
    boardViews: BoardView[];
};
