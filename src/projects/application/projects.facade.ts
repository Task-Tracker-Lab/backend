import { Injectable } from '@nestjs/common';
import { ProjectStatus } from '../domain/entities';
import type {
    CreateProjectDto,
    CreateProjectStateDto,
    CreateShareTokenDto,
    ReorderProjectsStatesDto,
    UpdateProjectDto,
    UpdateProjectStateDto,
} from './dtos';
import {
    CreateProjectUseCase,
    DeleteProjectUseCase,
    GenerateShareTokenUseCase,
    SetProjectStatusUseCase,
    UpdateProjectUseCase,
    FindProjectsByTeamQuery,
    GetProjectDetailQuery,
    CreateStateUseCase,
    DeleteStateUseCase,
    GetStateQuery,
    GetStatesQuery,
    UpdateStateUseCase,
    RestoreStateUseCase,
    ReorderStateUseCase,
} from './use-cases';

@Injectable()
export class ProjectsFacade {
    constructor(
        private readonly createProjectUC: CreateProjectUseCase,
        private readonly updateProjectUC: UpdateProjectUseCase,
        private readonly deleteProjectUC: DeleteProjectUseCase,
        private readonly setStatusUC: SetProjectStatusUseCase,
        private readonly generateTokenUC: GenerateShareTokenUseCase,
        private readonly getDetailQ: GetProjectDetailQuery,
        private readonly findByTeamQ: FindProjectsByTeamQuery,

        private readonly createStateUC: CreateStateUseCase,
        private readonly updateStateUC: UpdateStateUseCase,
        private readonly deleteStateUC: DeleteStateUseCase,
        private readonly getStateDetailQ: GetStateQuery,
        private readonly getStatesQ: GetStatesQuery,
        private readonly restoreStateUC: RestoreStateUseCase,
        private readonly reorderStateUC: ReorderStateUseCase,
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

    public async createState(slug: string, dto: CreateProjectStateDto, userId: string) {
        return this.createStateUC.execute(slug, dto, userId);
    }

    public async deleteState(slug: string, stateId: string, userId: string) {
        return this.deleteStateUC.execute(slug, stateId, userId);
    }

    public async updateState(
        slug: string,
        stateId: string,
        dto: UpdateProjectStateDto,
        userId: string,
    ) {
        return this.updateStateUC.execute(slug, stateId, dto, userId);
    }

    public async getDetailState(slug: string, stateId: string, userId: string) {
        return this.getStateDetailQ.execute(slug, stateId, userId);
    }

    public async getStates(slug: string, query: unknown, userId: string) {
        return this.getStatesQ.execute(slug, query, userId);
    }

    public async restoreState(slug: string, stateId: string, userId: string) {
        return this.restoreStateUC.execute(slug, stateId, userId);
    }

    public async reoderStates(slug: string, dto: ReorderProjectsStatesDto, userId: string) {
        return this.reorderStateUC.execute(slug, dto, userId);
    }
}
