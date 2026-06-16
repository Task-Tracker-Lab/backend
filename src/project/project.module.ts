import { TeamsModule } from '@core/teams';
import { UserModule } from '@core/user';
import { forwardRef, Module } from '@nestjs/common';

import { CONTROLLERS } from './application/controllers';
import { ProjectFacade } from './application/project.facade';
import { CreateProjectUseCase, FindProjectQuery, USE_CASES } from './application/use-cases';
import { POLICIES, ProjectAccessPolicy } from './domain/policy';
import { REPOSITORIES } from './infrastructure/persistence/repositories';

@Module({
    imports: [UserModule, forwardRef(() => TeamsModule)],
    controllers: CONTROLLERS,
    providers: [...REPOSITORIES, ...POLICIES, ...USE_CASES, ProjectFacade],
    exports: [FindProjectQuery, ProjectAccessPolicy, CreateProjectUseCase],
})
export class ProjectModule {}
