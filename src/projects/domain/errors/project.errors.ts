export const ProjectErrorCodes = {
    NOT_FOUND: 'PROJECT.NOT_FOUND',
    SLUG_DUPLICATE: 'PROJECT.SLUG_DUPLICATE',
    NAME_DUPLICATE: 'PROJECT.NAME_DUPLICATE',
    SLUG_INVALID: 'PROJECT.SLUG_INVALID',
    NAME_INVALID: 'PROJECT.NAME_INVALID',
    COLOR_INVALID: 'PROJECT.COLOR_INVALID',
    ICON_INVALID: 'PROJECT.ICON_INVALID',
    DESCRIPTION_TOO_LONG: 'PROJECT.DESCRIPTION_TOO_LONG',
    MAX_PROJECTS_REACHED: 'PROJECT.MAX_PROJECTS_REACHED',
    ALREADY_ARCHIVED: 'PROJECT.ALREADY_ARCHIVED',
    ALREADY_ACTIVE: 'PROJECT.ALREADY_ACTIVE',
    CANNOT_ARCHIVE_WITH_ACTIVE_TASKS: 'PROJECT.CANNOT_ARCHIVE_WITH_ACTIVE_TASKS',
    CANNOT_DELETE_NOT_ARCHIVED: 'PROJECT.CANNOT_DELETE_NOT_ARCHIVED',
    OWNER_NOT_IN_TEAM: 'PROJECT.OWNER_NOT_IN_TEAM',
    INVALID_VISIBILITY: 'PROJECT.INVALID_VISIBILITY',
    INVALID_STATUS: 'PROJECT.INVALID_STATUS',
    TEAM_REQUIRED: 'PROJECT.TEAM_REQUIRED',
    UPDATE_FAILED: 'PROJECT.UPDATE_FAILED',
    DELETE_FAILED: 'PROJECT.DELETE_FAILED',
    RESTORE_FAILED: 'PROJECT.RESTORE_FAILED',
} as const;

export type ProjectErrorCode = (typeof ProjectErrorCodes)[keyof typeof ProjectErrorCodes];

export const ProjectErrorMessages: Record<ProjectErrorCode, string> = {
    [ProjectErrorCodes.NOT_FOUND]: 'Проект не найден',
    [ProjectErrorCodes.SLUG_DUPLICATE]: 'Проект с таким ключом уже существует в команде',
    [ProjectErrorCodes.NAME_DUPLICATE]: 'Проект с таким названием уже существует в команде',
    [ProjectErrorCodes.SLUG_INVALID]:
        'Ключ проекта должен содержать только строчные латинские буквы и цифры (2-10 символов)',
    [ProjectErrorCodes.NAME_INVALID]:
        'Название проекта не может быть пустым и должно быть не длиннее 100 символов',
    [ProjectErrorCodes.COLOR_INVALID]: 'Цвет должен быть в формате HEX (например, #FFFFFF)',
    [ProjectErrorCodes.ICON_INVALID]: 'URL иконки слишком длинный (максимум 255 символов)',
    [ProjectErrorCodes.DESCRIPTION_TOO_LONG]: 'Описание слишком длинное (максимум 2000 символов)',
    [ProjectErrorCodes.MAX_PROJECTS_REACHED]: 'Достигнут лимит проектов в команде',
    [ProjectErrorCodes.ALREADY_ARCHIVED]: 'Проект уже находится в архиве',
    [ProjectErrorCodes.ALREADY_ACTIVE]: 'Проект уже активен',
    [ProjectErrorCodes.CANNOT_ARCHIVE_WITH_ACTIVE_TASKS]:
        'Нельзя архивировать проект с активными задачами',
    [ProjectErrorCodes.CANNOT_DELETE_NOT_ARCHIVED]:
        'Перед удалением проект необходимо архивировать',
    [ProjectErrorCodes.OWNER_NOT_IN_TEAM]: 'Владелец проекта должен быть участником команды',
    [ProjectErrorCodes.INVALID_VISIBILITY]: 'Недопустимый тип видимости проекта',
    [ProjectErrorCodes.INVALID_STATUS]: 'Недопустимый статус проекта',
    [ProjectErrorCodes.TEAM_REQUIRED]: 'ID команды обязателен',
    [ProjectErrorCodes.UPDATE_FAILED]: 'Не удалось обновить проект',
    [ProjectErrorCodes.DELETE_FAILED]: 'Не удалось удалить проект',
    [ProjectErrorCodes.RESTORE_FAILED]: 'Не удалось восстановить проект',
};
