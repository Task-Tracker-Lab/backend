import { Injectable } from '@nestjs/common';
import {
    CreateStateUseCase,
    DeleteStateUseCase,
    GetStateQuery,
    GetStatesQuery,
    ReorderStateUseCase,
    RestoreStateUseCase,
    UpdateStateUseCase,
} from './use-cases/states';
import {
    CreateStateDto,
    UpdateStateDto,
    ReordersStatesDto,
    CreateAreaDto,
    UpdateAreaDto,
} from './dtos';
import {
    CreateAreaUseCase,
    DeleteAreaUseCase,
    GetAreaQuery,
    GetAreasQuery,
    UpdateAreaUseCase,
} from './use-cases';

@Injectable()
export class AreaFacade {
    constructor(
        private readonly createAreaUC: CreateAreaUseCase,
        private readonly updateAreaUC: UpdateAreaUseCase,
        private readonly deleteAreaUC: DeleteAreaUseCase,
        private readonly getAreasQ: GetAreasQuery,
        private readonly getAreaQ: GetAreaQuery,

        private readonly getStatesQ: GetStatesQuery,
        private readonly getStateDetailQ: GetStateQuery,
        private readonly createStateUC: CreateStateUseCase,
        private readonly updateStateUC: UpdateStateUseCase,
        private readonly deleteStateUC: DeleteStateUseCase,
        private readonly restoreStateUC: RestoreStateUseCase,
        private readonly reorderStateUC: ReorderStateUseCase,
    ) {}

    public async createArea(slug: string, dto: CreateAreaDto, userId: string) {
        return this.createAreaUC.execute(slug, dto, userId);
    }

    public async updateArea(slug: string, key: string, dto: UpdateAreaDto, userId: string) {
        return this.updateAreaUC.execute(slug, key, dto, userId);
    }

    public async deleteArea(slug: string, key: string, userId: string) {
        return this.deleteAreaUC.execute(slug, key, userId);
    }

    public async getAreas(slug: string, deleted: boolean, userId: string) {
        return this.getAreasQ.execute(slug, deleted, userId);
    }

    public async getArea(slug: string, key: string, userId: string) {
        return this.getAreaQ.execute(slug, key, userId);
    }

    public async createState(slug: string, dto: CreateStateDto, userId: string) {
        return this.createStateUC.execute(slug, dto, userId);
    }

    public async deleteState(slug: string, stateId: string, userId: string) {
        return this.deleteStateUC.execute(slug, stateId, userId);
    }

    public async updateState(slug: string, stateId: string, dto: UpdateStateDto, userId: string) {
        return this.updateStateUC.execute(slug, stateId, dto, userId);
    }

    public async getDetailState(slug: string, stateId: string, userId: string) {
        return this.getStateDetailQ.execute(slug, stateId, userId);
    }

    public async getStates(slug: string, query: unknown, userId: string) {
        return this.getStatesQ.execute(slug, userId, query);
    }

    public async restoreState(slug: string, stateId: string, userId: string) {
        return this.restoreStateUC.execute(slug, stateId, userId);
    }

    public async reoderStates(slug: string, dto: ReordersStatesDto, userId: string) {
        return this.reorderStateUC.execute(slug, dto, userId);
    }
}
