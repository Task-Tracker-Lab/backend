import { AddProjectMemberUseCase } from './add.use-case';
import { DeleteProjectMemberUseCase } from './delete.use-case';
import { FindAllProjectMembersQuery } from './find-all.query';
import { FindProjectMemberQuery } from './find-project-member.query';
import { GetAvailableTeamMemberQuery } from './get-available.query';
import { UpdateProjectMemberUseCase } from './update.use-case';

export * from './add.use-case';
export * from './delete.use-case';
export * from './find-all.query';
export * from './get-available.query';
export * from './update.use-case';
export * from './find-project-member.query';

export const MemberQueries = [
    FindAllProjectMembersQuery,
    GetAvailableTeamMemberQuery,
    FindProjectMemberQuery,
];

export const MemberUseCases = [
    AddProjectMemberUseCase,
    DeleteProjectMemberUseCase,
    UpdateProjectMemberUseCase,
];
