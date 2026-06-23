import type { IssueType, PriorityType } from './enum';

export type IssueUser = {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatarUrl: string | null;
};

export type Issue = {
    readonly id: string;
    readonly title: string;
    readonly description: string | null;
    readonly descriptionHtml: string | null;
    readonly stateId: string | null;
    readonly areaId: string;
    readonly priority: PriorityType;
    readonly type: IssueType;
    readonly position: number;
    readonly storyPoints: number | null;
    readonly dueDate: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly deletedAt: string | null;

    readonly assignee: IssueUser | null;
    readonly reporter: IssueUser;
    readonly parent: { id: string; title: string } | null;
};

export type NewIssue = {
    readonly title: string;
    readonly areaId: string;

    readonly description?: string | null;
    readonly descriptionHtml?: string | null;
    readonly stateId?: string | null;
    readonly priority?: PriorityType;
    readonly type?: IssueType;
    readonly position?: number;
    readonly storyPoints?: number | null;
    readonly dueDate?: string | null;

    readonly reporterId?: string | null;
    readonly assigneeId?: string | null;
    readonly parentId?: string | null;
};
