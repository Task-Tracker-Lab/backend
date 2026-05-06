import { Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '../../../domain/repository';
import {
    Board,
    BoardColumn,
    BoardView,
    BoardWithRelations,
    NewBoard,
    NewBoardColumn,
    NewBoardView,
} from '@core/boards/domain/entities';
import { DATABASE_SERVICE, DatabaseService } from '@libs/database';
import * as schema from '../models';
import { asc, eq, inArray } from 'drizzle-orm';

@Injectable()
export class BoardsRepository implements IBoardsRepository {
    constructor(
        @Inject(DATABASE_SERVICE)
        private readonly db: DatabaseService<typeof schema>,
    ) {}

    async findAll(projectId: string): Promise<BoardWithRelations[]> {
        const boards = await this.db
            .select()
            .from(schema.boards)
            .where(eq(schema.boards.projectId, projectId))
            .orderBy(asc(schema.boards.position));

        if (boards.length === 0) {
            return [];
        }

        const boardIds = boards.map((board) => board.id);
        const [columns, views] = await Promise.all([
            this.db
                .select()
                .from(schema.boardColumns)
                .where(inArray(schema.boardColumns.boardId, boardIds))
                .orderBy(asc(schema.boardColumns.position)),
            this.db
                .select()
                .from(schema.boardViews)
                .where(inArray(schema.boardViews.boardId, boardIds))
                .orderBy(asc(schema.boardViews.position)),
        ]);

        const columnsByBoardId = this.groupByBoardId<BoardColumn>(columns);
        const viewsByBoardId = this.groupByBoardId<BoardView>(views);

        return boards.map((board) => ({
            ...board,
            boardColumns: columnsByBoardId.get(board.id) ?? [],
            boardViews: viewsByBoardId.get(board.id) ?? [],
        }));
    }

    async findById(id: string): Promise<BoardWithRelations | null> {
        const [board] = await this.db.select().from(schema.boards).where(eq(schema.boards.id, id));

        if (!board) {
            return null;
        }

        const [boardColumns, boardViews] = await Promise.all([
            this.db
                .select()
                .from(schema.boardColumns)
                .where(eq(schema.boardColumns.boardId, id))
                .orderBy(asc(schema.boardColumns.position)),
            this.db
                .select()
                .from(schema.boardViews)
                .where(eq(schema.boardViews.boardId, id))
                .orderBy(asc(schema.boardViews.position)),
        ]);

        return {
            ...board,
            boardColumns,
            boardViews,
        };
    }

    async create(
        board: NewBoard,
        columns: NewBoardColumn[],
        views: NewBoardView[],
    ): Promise<BoardWithRelations> {
        return await this.db.transaction(async (tx) => {
            const [newBoard] = await tx
                .insert(schema.boards)
                .values({
                    id: board.id,
                    name: board.name,
                    projectId: board.projectId,
                    ownerId: board.ownerId,
                    position: board.position,
                    settings: board.settings,
                })
                .returning();

            const boardViews = await tx.insert(schema.boardViews).values(views).returning();

            const boardColumns = await tx.insert(schema.boardColumns).values(columns).returning();

            return {
                ...newBoard,
                boardViews,
                boardColumns,
            };
        });
    }

    async update(id: string, data: Partial<Board>): Promise<BoardWithRelations | null> {
        const [updated] = await this.db
            .update(schema.boards)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(schema.boards.id, id))
            .returning();

        if (!updated) {
            return null;
        }

        const [boardColumns, boardViews] = await Promise.all([
            this.db
                .select()
                .from(schema.boardColumns)
                .where(eq(schema.boardColumns.boardId, id))
                .orderBy(asc(schema.boardColumns.position)),
            this.db
                .select()
                .from(schema.boardViews)
                .where(eq(schema.boardViews.boardId, id))
                .orderBy(asc(schema.boardViews.position)),
        ]);

        return {
            ...updated,
            boardColumns,
            boardViews,
        };
    }

    async remove(id: string): Promise<boolean> {
        const result = await this.db
            .delete(schema.boards)
            .where(eq(schema.boards.id, id))
            .returning({ id: schema.boards.id });

        return result.length > 0;
    }

    async findColumns(boardId: string): Promise<BoardColumn[]> {
        return this.db
            .select()
            .from(schema.boardColumns)
            .where(eq(schema.boardColumns.boardId, boardId))
            .orderBy(asc(schema.boardColumns.position));
    }

    async findColumnById(id: string): Promise<BoardColumn | null> {
        const [column] = await this.db
            .select()
            .from(schema.boardColumns)
            .where(eq(schema.boardColumns.id, id));

        return column ?? null;
    }

    async createColumn(column: NewBoardColumn): Promise<BoardColumn> {
        const [created] = await this.db.insert(schema.boardColumns).values(column).returning();

        return created;
    }

    async updateColumn(id: string, data: Partial<BoardColumn>): Promise<BoardColumn | null> {
        const [updated] = await this.db
            .update(schema.boardColumns)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(schema.boardColumns.id, id))
            .returning();

        return updated ?? null;
    }

    async removeColumn(id: string): Promise<boolean> {
        const result = await this.db
            .delete(schema.boardColumns)
            .where(eq(schema.boardColumns.id, id))
            .returning({ id: schema.boardColumns.id });

        return result.length > 0;
    }

    async findViews(boardId: string): Promise<BoardView[]> {
        return this.db
            .select()
            .from(schema.boardViews)
            .where(eq(schema.boardViews.boardId, boardId))
            .orderBy(asc(schema.boardViews.position));
    }

    async findViewById(id: string): Promise<BoardView | null> {
        const [view] = await this.db
            .select()
            .from(schema.boardViews)
            .where(eq(schema.boardViews.id, id));

        return view ?? null;
    }

    async createView(view: NewBoardView): Promise<BoardView> {
        const [created] = await this.db.insert(schema.boardViews).values(view).returning();

        return created;
    }

    async updateView(id: string, data: Partial<BoardView>): Promise<BoardView | null> {
        const [updated] = await this.db
            .update(schema.boardViews)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(schema.boardViews.id, id))
            .returning();

        return updated ?? null;
    }

    async removeView(id: string): Promise<boolean> {
        const result = await this.db
            .delete(schema.boardViews)
            .where(eq(schema.boardViews.id, id))
            .returning({ id: schema.boardViews.id });

        return result.length > 0;
    }

    private groupByBoardId<T extends { boardId: string }>(items: T[]): Map<string, T[]> {
        const grouped = new Map<string, T[]>();

        for (const item of items) {
            const current = grouped.get(item.boardId);
            if (current) {
                current.push(item);
            } else {
                grouped.set(item.boardId, [item]);
            }
        }

        return grouped;
    }
}
