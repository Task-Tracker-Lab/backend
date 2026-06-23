export const PRIORITY = {
    CRITICAL: 'critical',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
} as const;

export type PriorityType = (typeof PRIORITY)[keyof typeof PRIORITY];

export const PRIORITY_LIST = Object.values(PRIORITY);

export const ISSUE_TYPE = {
    BUG: 'bug',
    TASK: 'task',
    EPIC: 'epic',
} as const;

export type IssueType = (typeof ISSUE_TYPE)[keyof typeof ISSUE_TYPE];

export const ISSUE_TYPE_LIST = Object.values(ISSUE_TYPE);
