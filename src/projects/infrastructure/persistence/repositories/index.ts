import { MemberRepository } from './member.repository';
import { ProjectRepository } from './project.repository';

export const REPOSITORIES = [
    {
        provide: 'IProjectRepository',
        useClass: ProjectRepository,
    },
    {
        provide: 'IMemberRepository',
        useClass: MemberRepository,
    },
];
