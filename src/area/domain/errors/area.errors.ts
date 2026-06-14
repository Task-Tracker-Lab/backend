export const AreaErrorCodes = {
    // 404
    NOT_FOUND: 'AREA.NOT_FOUND',

    // 409 — Conflict
    SLUG_DUPLICATE: 'AREA.SLUG_DUPLICATE',
    TITLE_DUPLICATE: 'AREA.TITLE_DUPLICATE',
    ALREADY_LOCKED: 'AREA.ALREADY_LOCKED',
    ALREADY_UNLOCKED: 'AREA.ALREADY_UNLOCKED',

    // 400 — Bad Request
    SLUG_INVALID: 'AREA.SLUG_INVALID',
    COLOR_INVALID: 'AREA.COLOR_INVALID',
    ICON_INVALID: 'AREA.ICON_INVALID',
    PROJECT_REQUIRED: 'AREA.PROJECT_REQUIRED',
    DEFAULT_VIEW_INVALID: 'AREA.DEFAULT_VIEW_INVALID',
    POSITION_INVALID: 'AREA.POSITION_INVALID',
    MAX_TASKS_LIMIT_INVALID: 'AREA.MAX_TASKS_LIMIT_INVALID',

    // 403 — Forbidden
    MAX_LIMIT_REACHED: 'AREA.MAX_LIMIT_REACHED',
    LOCKED: 'AREA.LOCKED',
    ACCESS_DENIED: 'AREA.ACCESS_DENIED',

    // 422 — Unprocessable
    HAS_ACTIVE_TASKS: 'AREA.HAS_ACTIVE_TASKS',
    CANNOT_DELETE_LAST_AREA: 'AREA.CANNOT_DELETE_LAST_AREA',

    // 500 — Internal
    CREATE_FAILED: 'AREA.CREATE_FAILED',
    UPDATE_FAILED: 'AREA.UPDATE_FAILED',
    DELETE_FAILED: 'AREA.DELETE_FAILED',
    RESTORE_FAILED: 'AREA.RESTORE_FAILED',
    REORDER_FAILED: 'AREA.REORDER_FAILED',
} as const;

export type AreaErrorCode = (typeof AreaErrorCodes)[keyof typeof AreaErrorCodes];

export const AreaErrorMessages: Record<AreaErrorCode, string> = {
    [AreaErrorCodes.NOT_FOUND]: 'Область не найдена',

    [AreaErrorCodes.SLUG_DUPLICATE]: 'Область с таким ключом уже существует в проекте',
    [AreaErrorCodes.TITLE_DUPLICATE]: 'Область с таким названием уже существует в проекте',
    [AreaErrorCodes.ALREADY_LOCKED]: 'Область уже заблокирована',
    [AreaErrorCodes.ALREADY_UNLOCKED]: 'Область уже разблокирована',

    [AreaErrorCodes.SLUG_INVALID]:
        'Ключ области должен быть в формате kebab-case: строчные латинские буквы, цифры и дефисы',
    [AreaErrorCodes.COLOR_INVALID]: 'Цвет должен быть в формате HEX (например, #3b82f6)',
    [AreaErrorCodes.ICON_INVALID]: 'Иконка слишком длинная (максимум 20 символов)',
    [AreaErrorCodes.PROJECT_REQUIRED]: 'ID проекта обязателен',
    [AreaErrorCodes.DEFAULT_VIEW_INVALID]: 'Недопустимый вид отображения по умолчанию',
    [AreaErrorCodes.POSITION_INVALID]: 'Позиция должна быть неотрицательным целым числом',
    [AreaErrorCodes.MAX_TASKS_LIMIT_INVALID]: 'Лимит задач должен быть положительным целым числом',

    [AreaErrorCodes.MAX_LIMIT_REACHED]: 'Достигнут лимит областей в проекте',
    [AreaErrorCodes.LOCKED]: 'Область заблокирована и не может быть изменена',
    [AreaErrorCodes.ACCESS_DENIED]: 'У вас нет доступа к управлению областями этого проекта',

    [AreaErrorCodes.HAS_ACTIVE_TASKS]: 'Нельзя удалить область, в которой есть задачи',
    [AreaErrorCodes.CANNOT_DELETE_LAST_AREA]: 'Нельзя удалить последнюю область проекта',

    [AreaErrorCodes.CREATE_FAILED]: 'Не удалось создать область',
    [AreaErrorCodes.UPDATE_FAILED]: 'Не удалось обновить область',
    [AreaErrorCodes.DELETE_FAILED]: 'Не удалось удалить область',
    [AreaErrorCodes.RESTORE_FAILED]: 'Не удалось восстановить область',
    [AreaErrorCodes.REORDER_FAILED]: 'Не удалось изменить порядок областей',
} as const;
