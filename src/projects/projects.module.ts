import { forwardRef, Module } from '@nestjs/common';
import { TeamsModule } from '@core/teams';
import { CONTROLLERS } from './application/controller';
import { FindProjectQuery, USE_CASES } from './application/use-cases';
import { POLICIES, ProjectAccessPolicy } from './domain/policy';
import { ProjectFacade } from './application/project.facade';
import { REPOSITORIES } from './infrastructure/persistence/repositories';
import { UserModule } from '@core/user';

@Module({
    imports: [UserModule, forwardRef(() => TeamsModule)],
    controllers: CONTROLLERS,
    providers: [...REPOSITORIES, ...POLICIES, ...USE_CASES, ProjectFacade],
    exports: [FindProjectQuery, ProjectAccessPolicy],
})
export class ProjectsModule {}
