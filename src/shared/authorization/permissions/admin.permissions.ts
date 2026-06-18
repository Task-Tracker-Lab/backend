import { Action } from '@shared/authorization/types/action.enum';
import { type PermissionRule } from '@shared/authorization/types/permission-rule.interface';
import { Subject } from '@shared/authorization/types/subject.enum';

export const ADMIN_PERMISSIONS: PermissionRule[] = [
    {
        action: Action.READ,
        subject: Subject.TEAM,
    },
    {
        action: Action.UPDATE,
        subject: Subject.TEAM,
    },

    //team members
    {
        action: Action.MANAGE,
        subject: Subject.TEAM_MEMBER,
    },

    //project
    {
        action: Action.MANAGE,
        subject: Subject.PROJECT,
    },

    //task
    {
        action: Action.MANAGE,
        subject: Subject.TASK,
    },

    //invites
    {
        action: Action.MANAGE,
        subject: Subject.INVITE,
    },

    //roles
    {
        action: Action.MANAGE,
        subject: Subject.ROLE,
    },

    //billing
    {
        action: Action.READ,
        subject: Subject.BILLING,
    },
];
