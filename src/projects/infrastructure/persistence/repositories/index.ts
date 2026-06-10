import { ProjectStatesRepository } from './states.repository';
import { ProjectsRepository } from './projects.repository';

export const REPOSITORIES = [
    {
        provide: 'IProjectsRepository',
        useClass: ProjectsRepository,
    },
    {
        provide: 'IProjectStatesRepository',
        useClass: ProjectStatesRepository,
    },
];
