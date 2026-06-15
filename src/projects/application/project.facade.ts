import { Injectable } from '@nestjs/common';
import type { ProjectStatus } from '../domain/entities';
import { CheckSlugAvailabilityQuery } from './use-cases/project/check-slug.use-case';
import {
    AddProjectMemberDto,
    CreateProjectDto,
    CreateShareTokenDto,
    UpdateProjectDto,
    UpdateProjectMemberDto,
} from './dtos';
import {
    CreateProjectUseCase,
    DeleteProjectUseCase,
    GenerateShareTokenUseCase,
    SetProjectStatusUseCase,
    UpdateProjectUseCase,
    FindProjectsByTeamQuery,
    GetProjectDetailQuery,
} from './use-cases/project';
import {
    AddProjectMemberUseCase,
    DeleteProjectMemberUseCase,
    FindAllProjectMembersQuery,
    GetAvailableTeamMemberQuery,
    UpdateProjectMemberUseCase,
} from './use-cases';

@Injectable()
export class ProjectFacade {
    constructor(
        private readonly checkSlugAvailabilityQ: CheckSlugAvailabilityQuery,
        private readonly generateTokenUC: GenerateShareTokenUseCase,
        private readonly createProjectUC: CreateProjectUseCase,
        private readonly updateProjectUC: UpdateProjectUseCase,
        private readonly deleteProjectUC: DeleteProjectUseCase,
        private readonly setStatusUC: SetProjectStatusUseCase,
        private readonly findByTeamQ: FindProjectsByTeamQuery,
        private readonly getDetailQ: GetProjectDetailQuery,

        private readonly getMembersQ: FindAllProjectMembersQuery,
        private readonly addMemberUC: AddProjectMemberUseCase,
        private readonly removeMemberUC: DeleteProjectMemberUseCase,
        private readonly updateMemberRoleUC: UpdateProjectMemberUseCase,
        private readonly getAvailableTeamMembersQ: GetAvailableTeamMemberQuery,
    ) {}

    public async create(userId: string, teamId: string, dto: CreateProjectDto) {
        return this.createProjectUC.execute(userId, teamId, dto);
    }

    public async update(slug: string, teamId: string, userId: string, dto: UpdateProjectDto) {
        return this.updateProjectUC.execute(slug, teamId, userId, dto);
    }

    public async delete(slug: string, teamId: string, userId: string) {
        return this.deleteProjectUC.execute(slug, teamId, userId);
    }

    public async setStatus(slug: string, teamId: string, userId: string, status: ProjectStatus) {
        return this.setStatusUC.execute(slug, teamId, userId, status);
    }

    public async generateShareToken(
        slug: string,
        teamId: string,
        userId: string,
        dto: CreateShareTokenDto,
    ) {
        return this.generateTokenUC.execute(slug, teamId, userId, dto);
    }

    public async getDetail(slug: string, teamId: string, userId?: string, token?: string) {
        return this.getDetailQ.execute(slug, teamId, userId, token);
    }

    public async getTeamProjects(teamId: string, userId: string) {
        return this.findByTeamQ.execute(teamId, userId);
    }

    public async getMembers(teamId: string, userId: string) {
        return this.getMembersQ.execute(teamId, userId);
    }

    public async addMember(slug: string, userId: string, dto: AddProjectMemberDto) {
        return this.addMemberUC.execute(slug, userId, dto);
    }

    public async updateMemberRole(
        slug: string,
        memberId: string,
        userId: string,
        dto: UpdateProjectMemberDto,
    ) {
        return this.updateMemberRoleUC.execute(slug, memberId, userId, dto);
    }

    public async removeMember(slug: string, memberId: string, userId: string) {
        return this.removeMemberUC.execute(slug, memberId, userId);
    }

    public async getAvailableTeamMembers(slug: string, userId: string, search?: string) {
        return this.getAvailableTeamMembersQ.execute(slug, userId, search);
    }

    public async checkSlugAvailability(teamId: string, slug: string) {
        return this.checkSlugAvailabilityQ.execute(teamId, slug);
    }
}
