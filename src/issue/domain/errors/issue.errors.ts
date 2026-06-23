export const IssueErrorCodes = {
    NOT_FOUND: 'ISSUE.NOT_FOUND',

    TITLE_DUPLICATE: 'ISSUE.TITLE_DUPLICATE',
    ALREADY_DELETED: 'ISSUE.ALREADY_DELETED',
    NOT_DELETED: 'ISSUE.NOT_DELETED',

    TITLE_REQUIRED: 'ISSUE.TITLE_REQUIRED',
    TITLE_TOO_LONG: 'ISSUE.TITLE_TOO_LONG',
    AREA_REQUIRED: 'ISSUE.AREA_REQUIRED',
    INVALID_PRIORITY: 'ISSUE.INVALID_PRIORITY',
    INVALID_TYPE: 'ISSUE.INVALID_TYPE',
    INVALID_POSITION: 'ISSUE.INVALID_POSITION',
    PARENT_NOT_FOUND: 'ISSUE.PARENT_NOT_FOUND',
    SELF_PARENT: 'ISSUE.SELF_PARENT',

    ACCESS_DENIED: 'ISSUE.ACCESS_DENIED',

    HAS_SUBTASKS: 'ISSUE.HAS_SUBTASKS',
    CANNOT_MOVE_TO_DIFFERENT_AREA: 'ISSUE.CANNOT_MOVE_TO_DIFFERENT_AREA',

    CREATE_FAILED: 'ISSUE.CREATE_FAILED',
    UPDATE_FAILED: 'ISSUE.UPDATE_FAILED',
    DELETE_FAILED: 'ISSUE.DELETE_FAILED',
    RESTORE_FAILED: 'ISSUE.RESTORE_FAILED',
    MOVE_FAILED: 'ISSUE.MOVE_FAILED',
    ASSIGN_FAILED: 'ISSUE.ASSIGN_FAILED',
} as const;

export type IssueErrorCode = (typeof IssueErrorCodes)[keyof typeof IssueErrorCodes];

export const IssueErrorMessages: Record<IssueErrorCode, string> = {
    [IssueErrorCodes.NOT_FOUND]: 'Задача не найдена',

    [IssueErrorCodes.TITLE_DUPLICATE]: 'Задача с таким заголовком уже существует в этой колонке',
    [IssueErrorCodes.ALREADY_DELETED]: 'Задача уже удалена',
    [IssueErrorCodes.NOT_DELETED]: 'Задача не удалена, восстановление не требуется',

    [IssueErrorCodes.TITLE_REQUIRED]: 'Заголовок задачи не может быть пустым',
    [IssueErrorCodes.TITLE_TOO_LONG]: 'Заголовок задачи слишком длинный (максимум 255 символов)',
    [IssueErrorCodes.AREA_REQUIRED]: 'ID области обязателен для создания задачи',
    [IssueErrorCodes.INVALID_PRIORITY]: 'Недопустимый приоритет задачи',
    [IssueErrorCodes.INVALID_TYPE]: 'Недопустимый тип задачи',
    [IssueErrorCodes.INVALID_POSITION]: 'Позиция должна быть неотрицательным целым числом',
    [IssueErrorCodes.PARENT_NOT_FOUND]: 'Родительская задача не найдена',
    [IssueErrorCodes.SELF_PARENT]: 'Задача не может быть родителем самой себя',

    [IssueErrorCodes.ACCESS_DENIED]: 'У вас нет доступа к этой задаче',

    [IssueErrorCodes.HAS_SUBTASKS]: 'Нельзя удалить задачу, у которой есть активные подзадачи',
    [IssueErrorCodes.CANNOT_MOVE_TO_DIFFERENT_AREA]:
        'Нельзя переместить задачу в другую область через этот метод',

    [IssueErrorCodes.CREATE_FAILED]: 'Не удалось создать задачу',
    [IssueErrorCodes.UPDATE_FAILED]: 'Не удалось обновить задачу',
    [IssueErrorCodes.DELETE_FAILED]: 'Не удалось удалить задачу',
    [IssueErrorCodes.RESTORE_FAILED]: 'Не удалось восстановить задачу',
    [IssueErrorCodes.MOVE_FAILED]: 'Не удалось переместить задачу',
    [IssueErrorCodes.ASSIGN_FAILED]: 'Не удалось назначить исполнителя',
} as const;
