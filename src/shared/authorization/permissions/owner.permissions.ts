import { Action } from '@shared/authorization/types/action.enum';
import { Subject } from '@shared/authorization/types/subject.enum';

import type { PermissionRule } from '@shared/authorization/types/permission-rule.interface';

export const OWNER_PERMISSIONS: PermissionRule[] = [
    {
        action: Action.MANAGE,
        subject: Subject.TASK,
    },
    {
        action: Action.MANAGE,
        subject: Subject.PROJECT,
    },
    {
        action: Action.MANAGE,
        subject: Subject.TEAM,
    },
    {
        action: Action.MANAGE,
        subject: Subject.INVITE,
    },
    {
        action: Action.MANAGE,
        subject: Subject.TEAM_MEMBER,
    },
    {
        action: Action.MANAGE,
        subject: Subject.ROLE,
    },
    {
        action: Action.MANAGE,
        subject: Subject.BILLING,
    },
];
