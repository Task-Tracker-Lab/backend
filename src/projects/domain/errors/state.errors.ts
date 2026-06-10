export const ProjectStateErrorCodes = {
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

export type ProjectStateErrorCode =
    (typeof ProjectStateErrorCodes)[keyof typeof ProjectStateErrorCodes];

export const ProjectStateErrorMessages: Record<ProjectStateErrorCode, string> = {
    [ProjectStateErrorCodes.NOT_FOUND]: 'Состояние проекта не найдено',
    [ProjectStateErrorCodes.UPDATE_FAILED]: 'Не удалось обновить состояние',
    [ProjectStateErrorCodes.DUPLICATE_TITLE]:
        'Состояние с таким названием уже существует в проекте',
    [ProjectStateErrorCodes.DUPLICATE_TYPE]: 'Системный тип состояния уже используется в проекте',
    [ProjectStateErrorCodes.SYSTEM_TYPE_IMMUTABLE]:
        'Нельзя изменить тип системного состояния на custom',
    [ProjectStateErrorCodes.MAX_LIMIT_REACHED]: 'Достигнут лимит состояний в проекте',
    [ProjectStateErrorCodes.INVALID_TRANSITION]: 'Недопустимый переход между состояниями',
    [ProjectStateErrorCodes.LOCKED]: 'Состояние заблокировано и не может быть изменено',

    [ProjectStateErrorCodes.CREATE_FAILED]: 'Не удалось создать состояние',
    [ProjectStateErrorCodes.TITLE_REQUIRED]: 'Название состояния не может быть пустым',
    [ProjectStateErrorCodes.TITLE_TOO_LONG]:
        'Название состояния слишком длинное (максимум 255 символов)',
    [ProjectStateErrorCodes.PROJECT_REQUIRED]: 'ID проекта обязателен',
    [ProjectStateErrorCodes.SLUG_INVALID]:
        'Ключ должен содержать только строчные латинские буквы, цифры и _ (до 50 символов)',
    [ProjectStateErrorCodes.SLUG_DUPLICATE]: 'Состояние с таким ключом уже существует в проекте',
    [ProjectStateErrorCodes.COLOR_INVALID]: 'Цвет должен быть в формате HEX (например, #FFFFFF)',
    [ProjectStateErrorCodes.ICON_INVALID]: 'Иконка слишком длинная (максимум 20 символов)',
    [ProjectStateErrorCodes.DESCRIPTION_TOO_LONG]:
        'Описание слишком длинное (максимум 2000 символов)',
    [ProjectStateErrorCodes.ORDER_INDEX_INVALID]: 'Недопустимый индекс порядка',
    [ProjectStateErrorCodes.MAX_TASKS_LIMIT_INVALID]:
        'Лимит задач должен быть положительным числом',
    [ProjectStateErrorCodes.AUTO_TRANSITION_INVALID]: 'Недопустимое состояние для автоперехода',
    [ProjectStateErrorCodes.SYSTEM_TYPE_REQUIRED]:
        'Для проекта должен быть хотя бы один системный тип каждого вида (todo, in_progress, done)',

    [ProjectStateErrorCodes.DELETE_FAILED]: 'Не удалось удалить состояние',
    [ProjectStateErrorCodes.CANNOT_DELETE_SYSTEM]: 'Нельзя удалить системное состояние',
    [ProjectStateErrorCodes.CANNOT_DELETE_LAST_ACTIVE]:
        'Нельзя удалить последнее активное состояние проекта',
    [ProjectStateErrorCodes.HAS_ACTIVE_TASKS]: 'Нельзя удалить состояние, в котором есть задачи',
    [ProjectStateErrorCodes.ALREADY_DELETED]: 'Состояние уже удалено',

    [ProjectStateErrorCodes.RESTORE_FAILED]: 'Не удалось восстановить состояние',
    [ProjectStateErrorCodes.NOT_DELETED]: 'Состояние не удалено, восстановление не требуется',

    [ProjectStateErrorCodes.REORDER_FAILED]: 'Не удалось изменить порядок состояний',
    [ProjectStateErrorCodes.CANNOT_REORDER_SYSTEM]: 'Нельзя изменить порядок системных состояний',

    [ProjectStateErrorCodes.CATEGORY_IMMUTABLE]: 'Нельзя изменить категорию системного состояния',
    [ProjectStateErrorCodes.INVALID_CATEGORY]: 'Недопустимая категория состояния',

    [ProjectStateErrorCodes.CANNOT_HIDE_SYSTEM]: 'Нельзя скрыть системное состояние',

    [ProjectStateErrorCodes.NOTIFY_ON_ENTER_INVALID]:
        'Некорректная настройка уведомления при входе',
    [ProjectStateErrorCodes.NOTIFY_ON_EXIT_INVALID]:
        'Некорректная настройка уведомления при выходе',

    [ProjectStateErrorCodes.VERSION_CONFLICT]:
        'Состояние было изменено другим пользователем. Обновите страницу и попробуйте снова',
    [ProjectStateErrorCodes.VERSION_REQUIRED]: 'Версия состояния обязательна для обновления',

    [ProjectStateErrorCodes.WIP_LIMIT_EXCEEDED]: 'Достигнут лимит задач в этом состоянии',
    [ProjectStateErrorCodes.WIP_LIMIT_NEGATIVE]: 'Лимит задач не может быть отрицательным',

    [ProjectStateErrorCodes.AUTO_TRANSITION_SELF]:
        'Нельзя настроить автопереход состояния на само себя',
    [ProjectStateErrorCodes.AUTO_TRANSITION_NOT_FOUND]:
        'Целевое состояние для автоперехода не найдено',

    [ProjectStateErrorCodes.PARENT_STATE_NOT_FOUND]: 'Родительское состояние не найдено',
    [ProjectStateErrorCodes.CIRCULAR_DEPENDENCY]:
        'Обнаружена циклическая зависимость между состояниями',
};
