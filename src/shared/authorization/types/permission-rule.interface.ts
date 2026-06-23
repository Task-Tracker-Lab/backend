import { type Action } from './action.enum';
import { type Subject } from './subject.enum';

export interface PermissionRule {
    subject: Subject;
    action: Action;
    conditions?: Record<string, ConditionValue>;
}

export type ConditionValue = '$currentUser';
