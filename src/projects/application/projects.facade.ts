import { Injectable } from '@nestjs/common';
import { ProjectStatus } from '../domain/entities';
import type { CreateProjectDto, CreateShareTokenDto, UpdateProjectDto } from './dtos';
import {
    CreateProjectUseCase,
    DeleteProjectUseCase,
    GenerateShareTokenUseCase,
    SetProjectStatusUseCase,
    UpdateProjectUseCase,
    FindProjectsByTeamQuery,
    GetProjectDetailQuery,
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
    ) {}

    public async create(userId: string, teamId: string, dto: CreateProjectDto) {
        return this.createProjectUC.execute(userId, teamId, dto);
    }

    public async update(id: string, teamId: string, userId: string, dto: UpdateProjectDto) {
        return this.updateProjectUC.execute(id, teamId, userId, dto);
    }

    public async delete(id: string, teamId: string, userId: string) {
        return this.deleteProjectUC.execute(id, teamId, userId);
    }

    public async setStatus(id: string, teamId: string, userId: string, status: ProjectStatus) {
        return this.setStatusUC.execute(id, teamId, userId, status);
    }

    public async generateShareToken(
        id: string,
        teamId: string,
        userId: string,
        dto: CreateShareTokenDto,
    ) {
        return this.generateTokenUC.execute(id, teamId, userId, dto);
    }

    public async getDetail(id: string, teamId: string, userId?: string, token?: string) {
        return this.getDetailQ.execute(id, teamId, userId, token);
    }

    public async getTeamProjects(teamId: string, userId: string) {
        return this.findByTeamQ.execute(teamId, userId);
    }
}
