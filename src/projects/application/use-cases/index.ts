import { MemberQueries, MemberUseCases } from './member';
import { ProjectQueries, ProjectUseCases } from './project';

export * from './project';
export * from './member';

export const USE_CASES = [
    ...MemberQueries,
    ...ProjectQueries,
    ...MemberUseCases,
    ...ProjectUseCases,
];
