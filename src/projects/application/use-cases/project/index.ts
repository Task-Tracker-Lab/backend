import { CreateProjectUseCase } from './create.use-case';
import { DeleteProjectUseCase } from './delete.use-case';
import { GenerateShareTokenUseCase } from './generate-share-token.use-case';
import { SetProjectStatusUseCase } from './set-status.use-case';
import { UpdateProjectUseCase } from './update.use-case';
import { FindProjectsByTeamQuery } from './find-by-team.query';
import { GetProjectDetailQuery } from './get-detail.query';
import { FindProjectQuery } from './find-one.query';
import { CheckSlugAvailabilityQuery } from './check-slug.use-case';

export * from './find-by-team.query';
export * from './find-one.query';
export * from './create.use-case';
export * from './delete.use-case';
export * from './generate-share-token.use-case';
export * from './get-detail.query';
export * from './set-status.use-case';
export * from './update.use-case';
export * from './check-slug.use-case';

export const ProjectUseCases = [
    CreateProjectUseCase,
    DeleteProjectUseCase,
    GenerateShareTokenUseCase,
    SetProjectStatusUseCase,
    UpdateProjectUseCase,
];

export const ProjectQueries = [
    CheckSlugAvailabilityQuery,
    FindProjectsByTeamQuery,
    GetProjectDetailQuery,
    FindProjectQuery,
];
