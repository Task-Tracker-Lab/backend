import { forwardRef, Module } from '@nestjs/common';
import { ProjectsRepository } from './infrastructure/persistence/repositories';
import { TeamsModule } from '@core/teams';
import { CONTROLLERS } from './application/controller';
import { FindProjectQuery, ProjectQueries, ProjectUseCases } from './application/use-cases';
import { POLICIES, ProjectAccessPolicy } from './domain/policy';
import { ProjectsFacade } from './application/projects.facade';

const REPOSITORY = {
    provide: 'IProjectsRepository',
    useClass: ProjectsRepository,
};

@Module({
    imports: [forwardRef(() => TeamsModule)],
    controllers: CONTROLLERS,
    providers: [REPOSITORY, ...POLICIES, ...ProjectUseCases, ...ProjectQueries, ProjectsFacade],
    exports: [FindProjectQuery, ProjectAccessPolicy],
})
export class ProjectsModule {}
