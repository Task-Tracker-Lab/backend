import { Action } from '@shared/authorization/types/action.enum';
import { type PermissionRule } from '@shared/authorization/types/permission-rule.interface';
import { Subject } from '@shared/authorization/types/subject.enum';

export const MEMBER_PERMISSIONS: PermissionRule[] = [
    {
        action: Action.MANAGE,
        subject: Subject.TASK,
        conditions: {
            ownerId: '$currentUser',
        },
    },

    //project
    {
        action: Action.READ,
        subject: Subject.PROJECT,
    },
];
