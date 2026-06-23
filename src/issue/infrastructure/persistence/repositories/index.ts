import { IssueRepository } from './issue.repository';

export const REPOSITORIES = [
    {
        provide: 'IIssueRepository',
        useClass: IssueRepository,
    },
];
