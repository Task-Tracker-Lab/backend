export const MemberErrorCodes = {
    // 404
    NOT_FOUND: 'MEMBER.NOT_FOUND',

    // 409 — Conflict
    ALREADY_EXISTS: 'MEMBER.ALREADY_EXISTS',

    // 400 — Bad Request
    SELF_ADD: 'MEMBER.SELF_ADD',
    SELF_REMOVE_OWNER: 'MEMBER.SELF_REMOVE_OWNER',
    NOT_IN_TEAM: 'MEMBER.NOT_IN_TEAM',
    INVALID_ROLE: 'MEMBER.INVALID_ROLE',

    // 403 — Forbidden
    CANNOT_REMOVE_OWNER: 'MEMBER.CANNOT_REMOVE_OWNER',
    CANNOT_CHANGE_OWNER: 'MEMBER.CANNOT_CHANGE_OWNER',
    CANNOT_ASSIGN_OWNER: 'MEMBER.CANNOT_ASSIGN_OWNER',
    ADMIN_REMOVE_FORBIDDEN: 'MEMBER.ADMIN_REMOVE_FORBIDDEN',
    ADMIN_CHANGE_FORBIDDEN: 'MEMBER.ADMIN_CHANGE_FORBIDDEN',
    ACCESS_DENIED: 'MEMBER.ACCESS_DENIED',
    LIMIT_REACHED: 'MEMBER.LIMIT_REACHED',

    INSUFFICIENT_PERMISSIONS: 'MEMBER.INSUFFICIENT_PERMISSIONS',

    // 500 — Internal
    CREATE_FAILED: 'MEMBER.CREATE_FAILED',
    UPDATE_FAILED: 'MEMBER.UPDATE_FAILED',
    DELETE_FAILED: 'MEMBER.DELETE_FAILED',
} as const;

export type MemberErrorCode = (typeof MemberErrorCodes)[keyof typeof MemberErrorCodes];

export const MemberErrorMessages: Record<MemberErrorCode, string> = {
    [MemberErrorCodes.NOT_FOUND]: 'Участник не найден в проекте',
    [MemberErrorCodes.ALREADY_EXISTS]: 'Пользователь уже является участником проекта',
    [MemberErrorCodes.SELF_ADD]: 'Нельзя добавить самого себя в участники',
    [MemberErrorCodes.SELF_REMOVE_OWNER]:
        'Владелец не может покинуть проект. Сначала передайте права другому участнику',
    [MemberErrorCodes.NOT_IN_TEAM]: 'Пользователь не является участником команды',
    [MemberErrorCodes.INVALID_ROLE]: 'Недопустимая роль. Доступные роли: admin, member, viewer',
    [MemberErrorCodes.CANNOT_REMOVE_OWNER]: 'Невозможно удалить владельца проекта',
    [MemberErrorCodes.CANNOT_CHANGE_OWNER]: 'Невозможно изменить роль владельца проекта',
    [MemberErrorCodes.CANNOT_ASSIGN_OWNER]:
        'Нельзя назначить роль владельца через этот метод. Используйте трансфер прав',
    [MemberErrorCodes.ADMIN_REMOVE_FORBIDDEN]: 'Только владелец может удалить администратора',
    [MemberErrorCodes.ADMIN_CHANGE_FORBIDDEN]:
        'Только владелец может назначать или снимать роль администратора',
    [MemberErrorCodes.ACCESS_DENIED]: 'У вас нет доступа к участникам этого проекта',
    [MemberErrorCodes.LIMIT_REACHED]: 'Достигнут лимит участников проекта',
    [MemberErrorCodes.CREATE_FAILED]: 'Не удалось добавить участника',
    [MemberErrorCodes.UPDATE_FAILED]: 'Не удалось обновить роль участника',
    [MemberErrorCodes.DELETE_FAILED]: 'Не удалось удалить участника',
    [MemberErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Требуется одна из ролей',
} as const;
