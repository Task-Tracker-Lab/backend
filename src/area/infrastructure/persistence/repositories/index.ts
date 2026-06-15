import { AreaRepository } from './area.repository';
import { StateRepository } from './state.repository';

export const REPOSITORIES = [
    {
        provide: 'IAreaRepository',
        useClass: AreaRepository,
    },
    {
        provide: 'IStateRepository',
        useClass: StateRepository,
    },
];
