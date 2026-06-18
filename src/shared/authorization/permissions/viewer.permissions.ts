import { Action } from '@shared/authorization/types/action.enum';
import { type PermissionRule } from '@shared/authorization/types/permission-rule.interface';
import { Subject } from '@shared/authorization/types/subject.enum';

export const VIEWER_PERMISSIONS: PermissionRule[] = [
    // team
    {
        action: Action.READ,
        subject: Subject.TEAM,
    },

    //projects
    {
        action: Action.READ,
        subject: Subject.PROJECT,
    },

    //tasks
    {
        action: Action.READ,
        subject: Subject.TASK,
    },

    //team members
    {
        action: Action.READ,
        subject: Subject.TEAM_MEMBER,
    },
];
