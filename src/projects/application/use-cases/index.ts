import { CreateProjectUseCase } from './create-project.use-case';
import { DeleteProjectUseCase } from './delete-project.use-case';
import { GenerateShareTokenUseCase } from './generate-share-token.use-case';
import { SetProjectStatusUseCase } from './set-project-status.use-case';
import { UpdateProjectUseCase } from './update-project.use-case';
import { FindProjectsByTeamQuery } from './find-projects-by-team.query';
import { GetProjectDetailQuery } from './get-project-detail.query';
import { FindProjectQuery } from './find-project.query';
import { CreateStateUseCase } from './states/create-state.use-case';
import { DeleteStateUseCase } from './states/delete-state.use-case';
import { UpdateStateUseCase } from './states/update-state.use-case';
import { GetStateQuery } from './states/get-state.query';
import { GetStatesQuery } from './states/get-states.query';
import { RestoreStateUseCase } from './states/restore-state.use-state';
import { ReorderStateUseCase } from './states/reorder-states.use-case';

export * from './find-projects-by-team.query';
export * from './find-project.query';
export * from './create-project.use-case';
export * from './delete-project.use-case';
export * from './generate-share-token.use-case';
export * from './get-project-detail.query';
export * from './set-project-status.use-case';
export * from './update-project.use-case';
export * from './states/create-state.use-case';
export * from './states/delete-state.use-case';
export * from './states/update-state.use-case';
export * from './states/get-state.query';
export * from './states/get-states.query';
export * from './states/restore-state.use-state';
export * from './states/update-state.use-case';
export * from './states/reorder-states.use-case';

export const ProjectUseCases = [
    CreateProjectUseCase,
    DeleteProjectUseCase,
    GenerateShareTokenUseCase,
    SetProjectStatusUseCase,
    UpdateProjectUseCase,
];

export const ProjectStatesUseCases = [
    CreateStateUseCase,
    RestoreStateUseCase,
    DeleteStateUseCase,
    UpdateStateUseCase,
    GetStateQuery,
    GetStatesQuery,
    ReorderStateUseCase,
];

export const ProjectQueries = [FindProjectsByTeamQuery, GetProjectDetailQuery, FindProjectQuery];

export const USE_CASES = [...ProjectUseCases, ...ProjectStatesUseCases, ...ProjectQueries];
