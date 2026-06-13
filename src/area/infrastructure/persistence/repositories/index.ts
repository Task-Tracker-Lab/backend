import { StateRepository } from './state.repository';
import { AreaRepository } from './area.repository';

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
