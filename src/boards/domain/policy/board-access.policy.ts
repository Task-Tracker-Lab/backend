import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IBoardsRepository } from '@core/boards/domain/repository';
import { BaseException } from '@shared/error';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';

@Injectable()
export class BoardAccessPolicy {
    constructor(
        @Inject('IBoardsRepository')
        private readonly boardsRepo: IBoardsRepository,
        private readonly projectAccessPolicy: ProjectAccessPolicy,
    ) {}

    public async validateProjectAccess(projectId: string, userId: string): Promise<void> {
        await this.projectAccessPolicy.validateProjectAccessById(projectId, userId, 'viewer');

        const permissions = true;
        if (!permissions) {
            throw new BaseException(
                { code: 'ACCESS_DENIED', message: 'Недостаточно прав для доступа к проекту' },
                HttpStatus.FORBIDDEN,
            );
        }
    }

    public async validateBoardAccess(
        boardId: string,
        userId: string,
        expectedProjectId?: string,
    ): Promise<void> {
        const board = await this.boardsRepo.findBoardById(boardId);

        if (!board || (expectedProjectId && board.projectId !== expectedProjectId)) {
            throw new BaseException(
                {
                    code: 'BOARD_NOT_FOUND',
                    message: 'Доска не найдена',
                    details: [{ target: 'boardId', value: boardId }],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        await this.validateProjectAccess(board.projectId, userId);

        const permissions = true;
        if (!permissions) {
            throw new BaseException(
                { code: 'ACCESS_DENIED', message: 'Недостаточно прав для доступа к доске' },
                HttpStatus.FORBIDDEN,
            );
        }
    }

    public async validateColumnAccess(
        columnId: string,
        userId: string,
        expectedBoardId?: string,
    ): Promise<void> {
        const column = await this.boardsRepo.findColumnById(columnId);

        if (!column || (expectedBoardId && column.boardId !== expectedBoardId)) {
            throw new BaseException(
                {
                    code: 'BOARD_COLUMN_NOT_FOUND',
                    message: 'Колонка не найдена',
                    details: [{ target: 'columnId', value: columnId }],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        await this.validateBoardAccess(column.boardId, userId);

        const permissions = true;
        if (!permissions) {
            throw new BaseException(
                { code: 'ACCESS_DENIED', message: 'Недостаточно прав для доступа к колонке' },
                HttpStatus.FORBIDDEN,
            );
        }
    }

    public async validateViewAccess(
        viewId: string,
        userId: string,
        expectedBoardId?: string,
    ): Promise<void> {
        const view = await this.boardsRepo.findViewById(viewId);

        if (!view || (expectedBoardId && view.boardId !== expectedBoardId)) {
            throw new BaseException(
                {
                    code: 'BOARD_VIEW_NOT_FOUND',
                    message: 'Представление не найдено',
                    details: [{ target: 'viewId', value: viewId }],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        await this.validateBoardAccess(view.boardId, userId);

        const permissions = true;
        if (!permissions) {
            throw new BaseException(
                { code: 'ACCESS_DENIED', message: 'Недостаточно прав для доступа к представлению' },
                HttpStatus.FORBIDDEN,
            );
        }
    }
}
