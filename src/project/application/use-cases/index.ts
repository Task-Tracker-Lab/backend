import { FindProjectMemberQuery, MemberQueries, MemberUseCases } from './member';
import {
    CheckVisibilityOrThrowQuery,
    CreateProjectUseCase,
    FindProjectQuery,
    ProjectQueries,
    ProjectUseCases,
} from './project';

export * from './project';
export * from './member';

export const USE_CASES = [
    ...MemberQueries,
    ...ProjectQueries,
    ...MemberUseCases,
    ...ProjectUseCases,
];

export const EXPORT_USE_CASES = [
    FindProjectQuery,
    CreateProjectUseCase,
    FindProjectMemberQuery,
    CheckVisibilityOrThrowQuery,
];
