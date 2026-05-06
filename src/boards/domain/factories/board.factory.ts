import { BoardType, NewBoard, NewBoardColumn, NewBoardView } from '@core/boards/domain/entities';
import { createId } from '@paralleldrive/cuid2';
import { CreateBoardDto } from '@core/boards/application/dtos';

export class BoardFactory {
    static createView(props: {
        boardId: string;
        type: BoardType;
        name?: string;
        position: number;
        settings?: Record<string, unknown>;
    }): NewBoardView {
        return {
            id: createId(),
            boardId: props.boardId,
            type: props.type,
            name: props.name ?? this.getDefaultViewName(props.type),
            position: props.position,
            settings: props.settings ?? this.getDefaultSettings(props.type),
        };
    }

    static createBoard(
        projectId: string,
        ownerId: string,
        dto: CreateBoardDto,
    ): { board: NewBoard; columns: NewBoardColumn[]; views: NewBoardView[] } {
        const boardId = createId();
        const boardPosition = dto.position ?? Date.now();
        const board: NewBoard = {
            id: boardId,
            name: dto.name,
            projectId,
            ownerId,
            position: boardPosition,
            settings: dto.settings ?? {},
        };

        const defaultViewTypes: BoardType[] = ['kanban', 'calendar', 'gantt_matrix'];

        const views = defaultViewTypes.map((type, index) =>
            this.createView({
                boardId,
                type,
                position: (index + 1) * 1000,
            }),
        );

        const columns = [
            { id: createId(), boardId, name: 'К выполнению', position: 1000, color: '#64748b' },
            { id: createId(), boardId, name: 'В работе', position: 2000, color: '#3b82f6' },
            { id: createId(), boardId, name: 'Готово', position: 3000, color: '#22c55e' },
        ];

        return { board, columns, views };
    }

    private static getDefaultViewName(type: BoardType): string {
        const names: Record<BoardType, string> = {
            kanban: 'Доска',
            calendar: 'Календарь',
            gantt_matrix: 'Гант',
        };
        return names[type];
    }

    private static getDefaultSettings(type: BoardType): Record<string, unknown> {
        switch (type) {
            case 'kanban':
                return { mock: 'kanban_mock_setting' };
            case 'calendar':
                return { mock: 'calendar_mock_setting' };
            case 'gantt_matrix':
                return { mock: 'gantt_mock_setting' };
            default:
                const exhaustiveCheck: never = type;
                return exhaustiveCheck;
        }
    }
}
