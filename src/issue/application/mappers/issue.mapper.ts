import type { IssueResponse } from '../dtos';
import type { Issue } from '@core/issue/domain/entities';

export class IssueMapper {
    public static toResponseDto(issue: Issue): IssueResponse {
        return {
            id: issue.id,
            title: issue.title,
            description: issue.description ?? null,
            priority: issue.priority,
            type: issue.type,
            areaId: issue.areaId,
            stateId: issue.stateId ?? null,
            position: issue.position ?? 0,
            assignee: issue.assignee ?? null,
            reporter: issue.reporter ?? null,
            parent: issue.parent ?? null,
            //TODO: labels
            labels: [],
            storyPoints: issue.storyPoints ?? null,
            dueDate: issue.dueDate && new Date(issue.dueDate).toISOString(),
            createdAt: new Date(issue.createdAt).toISOString(),
            updatedAt: new Date(issue.updatedAt).toISOString(),
            //TODO: created by
            createdBy: null,
            deletedAt: issue.deletedAt && new Date(issue.deletedAt).toISOString(),
        };
    }
}
