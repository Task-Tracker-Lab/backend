import { forwardRef, Module } from '@nestjs/common';
import { TeamsModule } from '@core/teams';
import { CONTROLLERS } from './application/controller';
import { FindProjectQuery, USE_CASES } from './application/use-cases';
import { POLICIES, ProjectAccessPolicy } from './domain/policy';
import { ProjectsFacade } from './application/projects.facade';
import { REPOSITORIES } from './infrastructure/persistence/repositories';

@Module({
    imports: [forwardRef(() => TeamsModule)],
    controllers: CONTROLLERS,
    providers: [...REPOSITORIES, ...POLICIES, ...USE_CASES, ProjectsFacade],
    exports: [FindProjectQuery, ProjectAccessPolicy],
})
export class ProjectsModule {}
