export const StateErrorCodes = {
    NOT_FOUND: 'STATE.NOT_FOUND',
    UPDATE_FAILED: 'STATE.UPDATE_FAILED',
    DUPLICATE_TITLE: 'STATE.DUPLICATE_TITLE',
    DUPLICATE_TYPE: 'STATE.DUPLICATE_TYPE',
    SYSTEM_TYPE_IMMUTABLE: 'STATE.SYSTEM_TYPE_IMMUTABLE',
    MAX_LIMIT_REACHED: 'STATE.MAX_LIMIT_REACHED',
    INVALID_TRANSITION: 'STATE.INVALID_TRANSITION',
    LOCKED: 'STATE.LOCKED',

    CREATE_FAILED: 'STATE.CREATE_FAILED',
    TITLE_REQUIRED: 'STATE.TITLE_REQUIRED',
    TITLE_TOO_LONG: 'STATE.TITLE_TOO_LONG',
    PROJECT_REQUIRED: 'STATE.PROJECT_REQUIRED',
    SLUG_INVALID: 'STATE.SLUG_INVALID',
    SLUG_DUPLICATE: 'STATE.SLUG_DUPLICATE',
    COLOR_INVALID: 'STATE.COLOR_INVALID',
    ICON_INVALID: 'STATE.ICON_INVALID',
    DESCRIPTION_TOO_LONG: 'STATE.DESCRIPTION_TOO_LONG',
    ORDER_INDEX_INVALID: 'STATE.ORDER_INDEX_INVALID',
    MAX_TASKS_LIMIT_INVALID: 'STATE.MAX_TASKS_LIMIT_INVALID',
    AUTO_TRANSITION_INVALID: 'STATE.AUTO_TRANSITION_INVALID',
    SYSTEM_TYPE_REQUIRED: 'STATE.SYSTEM_TYPE_REQUIRED',

    DELETE_FAILED: 'STATE.DELETE_FAILED',
    CANNOT_DELETE_SYSTEM: 'STATE.CANNOT_DELETE_SYSTEM',
    CANNOT_DELETE_LAST_ACTIVE: 'STATE.CANNOT_DELETE_LAST_ACTIVE',
    HAS_ACTIVE_TASKS: 'STATE.HAS_ACTIVE_TASKS',
    ALREADY_DELETED: 'STATE.ALREADY_DELETED',

    RESTORE_FAILED: 'STATE.RESTORE_FAILED',
    NOT_DELETED: 'STATE.NOT_DELETED',

    REORDER_FAILED: 'STATE.REORDER_FAILED',
    CANNOT_REORDER_SYSTEM: 'STATE.CANNOT_REORDER_SYSTEM',

    CATEGORY_IMMUTABLE: 'STATE.CATEGORY_IMMUTABLE',
    INVALID_CATEGORY: 'STATE.INVALID_CATEGORY',

    CANNOT_HIDE_SYSTEM: 'STATE.CANNOT_HIDE_SYSTEM',

    NOTIFY_ON_ENTER_INVALID: 'STATE.NOTIFY_ON_ENTER_INVALID',
    NOTIFY_ON_EXIT_INVALID: 'STATE.NOTIFY_ON_EXIT_INVALID',

    VERSION_CONFLICT: 'STATE.VERSION_CONFLICT',
    VERSION_REQUIRED: 'STATE.VERSION_REQUIRED',

    WIP_LIMIT_EXCEEDED: 'STATE.WIP_LIMIT_EXCEEDED',
    WIP_LIMIT_NEGATIVE: 'STATE.WIP_LIMIT_NEGATIVE',

    AUTO_TRANSITION_SELF: 'STATE.AUTO_TRANSITION_SELF',
    AUTO_TRANSITION_NOT_FOUND: 'STATE.AUTO_TRANSITION_NOT_FOUND',

    PARENT_STATE_NOT_FOUND: 'STATE.PARENT_STATE_NOT_FOUND',
    CIRCULAR_DEPENDENCY: 'STATE.CIRCULAR_DEPENDENCY',
} as const;

export type StateErrorCode = (typeof StateErrorCodes)[keyof typeof StateErrorCodes];

export const StateErrorMessages: Record<StateErrorCode, string> = {
    [StateErrorCodes.NOT_FOUND]: 'Состояние проекта не найдено',
    [StateErrorCodes.UPDATE_FAILED]: 'Не удалось обновить состояние',
    [StateErrorCodes.DUPLICATE_TITLE]: 'Состояние с таким названием уже существует в проекте',
    [StateErrorCodes.DUPLICATE_TYPE]: 'Системный тип состояния уже используется в проекте',
    [StateErrorCodes.SYSTEM_TYPE_IMMUTABLE]: 'Нельзя изменить тип системного состояния на custom',
    [StateErrorCodes.MAX_LIMIT_REACHED]: 'Достигнут лимит состояний в проекте',
    [StateErrorCodes.INVALID_TRANSITION]: 'Недопустимый переход между состояниями',
    [StateErrorCodes.LOCKED]: 'Состояние заблокировано и не может быть изменено',

    [StateErrorCodes.CREATE_FAILED]: 'Не удалось создать состояние',
    [StateErrorCodes.TITLE_REQUIRED]: 'Название состояния не может быть пустым',
    [StateErrorCodes.TITLE_TOO_LONG]: 'Название состояния слишком длинное (максимум 255 символов)',
    [StateErrorCodes.PROJECT_REQUIRED]: 'ID проекта обязателен',
    [StateErrorCodes.SLUG_INVALID]:
        'Ключ должен содержать только строчные латинские буквы, цифры и _ (до 50 символов)',
    [StateErrorCodes.SLUG_DUPLICATE]: 'Состояние с таким ключом уже существует в проекте',
    [StateErrorCodes.COLOR_INVALID]: 'Цвет должен быть в формате HEX (например, #FFFFFF)',
    [StateErrorCodes.ICON_INVALID]: 'Иконка слишком длинная (максимум 20 символов)',
    [StateErrorCodes.DESCRIPTION_TOO_LONG]: 'Описание слишком длинное (максимум 2000 символов)',
    [StateErrorCodes.ORDER_INDEX_INVALID]: 'Недопустимый индекс порядка',
    [StateErrorCodes.MAX_TASKS_LIMIT_INVALID]: 'Лимит задач должен быть положительным числом',
    [StateErrorCodes.AUTO_TRANSITION_INVALID]: 'Недопустимое состояние для автоперехода',
    [StateErrorCodes.SYSTEM_TYPE_REQUIRED]:
        'Для проекта должен быть хотя бы один системный тип каждого вида (todo, in_progress, done)',

    [StateErrorCodes.DELETE_FAILED]: 'Не удалось удалить состояние',
    [StateErrorCodes.CANNOT_DELETE_SYSTEM]: 'Нельзя удалить системное состояние',
    [StateErrorCodes.CANNOT_DELETE_LAST_ACTIVE]:
        'Нельзя удалить последнее активное состояние проекта',
    [StateErrorCodes.HAS_ACTIVE_TASKS]: 'Нельзя удалить состояние, в котором есть задачи',
    [StateErrorCodes.ALREADY_DELETED]: 'Состояние уже удалено',

    [StateErrorCodes.RESTORE_FAILED]: 'Не удалось восстановить состояние',
    [StateErrorCodes.NOT_DELETED]: 'Состояние не удалено, восстановление не требуется',

    [StateErrorCodes.REORDER_FAILED]: 'Не удалось изменить порядок состояний',
    [StateErrorCodes.CANNOT_REORDER_SYSTEM]: 'Нельзя изменить порядок системных состояний',

    [StateErrorCodes.CATEGORY_IMMUTABLE]: 'Нельзя изменить категорию системного состояния',
    [StateErrorCodes.INVALID_CATEGORY]: 'Недопустимая категория состояния',

    [StateErrorCodes.CANNOT_HIDE_SYSTEM]: 'Нельзя скрыть системное состояние',

    [StateErrorCodes.NOTIFY_ON_ENTER_INVALID]: 'Некорректная настройка уведомления при входе',
    [StateErrorCodes.NOTIFY_ON_EXIT_INVALID]: 'Некорректная настройка уведомления при выходе',

    [StateErrorCodes.VERSION_CONFLICT]:
        'Состояние было изменено другим пользователем. Обновите страницу и попробуйте снова',
    [StateErrorCodes.VERSION_REQUIRED]: 'Версия состояния обязательна для обновления',

    [StateErrorCodes.WIP_LIMIT_EXCEEDED]: 'Достигнут лимит задач в этом состоянии',
    [StateErrorCodes.WIP_LIMIT_NEGATIVE]: 'Лимит задач не может быть отрицательным',

    [StateErrorCodes.AUTO_TRANSITION_SELF]: 'Нельзя настроить автопереход состояния на само себя',
    [StateErrorCodes.AUTO_TRANSITION_NOT_FOUND]: 'Целевое состояние для автоперехода не найдено',

    [StateErrorCodes.PARENT_STATE_NOT_FOUND]: 'Родительское состояние не найдено',
    [StateErrorCodes.CIRCULAR_DEPENDENCY]: 'Обнаружена циклическая зависимость между состояниями',
};
