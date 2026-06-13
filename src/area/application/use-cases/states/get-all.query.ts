import { IStateRepository } from '@core/area/domain/repository';
import { Inject, Injectable } from '@nestjs/common';
import { GetAreaQuery } from '../areas';

@Injectable()
export class GetStatesQuery {
    constructor(
        @Inject('IStateRepository')
        private readonly stateRepo: IStateRepository,
        private readonly getAreaQ: GetAreaQuery,
    ) {}

    async execute(slug: string, userId: string, query: unknown) {
        const area = await this.getAreaQ.execute(slug, userId, 'viewer');
        const states = await this.stateRepo.find(area.id, query);

        return states;
    }
}
