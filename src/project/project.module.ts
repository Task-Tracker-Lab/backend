import { TeamsModule } from '@core/teams';
import { UserModule } from '@core/user';
import { forwardRef, Module } from '@nestjs/common';

import { CONTROLLERS } from './application/controllers';
import { ProjectFacade } from './application/project.facade';
import { USE_CASES, EXPORT_USE_CASES } from './application/use-cases';
import { POLICIES } from './domain/policy';
import { REPOSITORIES } from './infrastructure/persistence/repositories';

@Module({
    imports: [UserModule, forwardRef(() => TeamsModule)],
    controllers: CONTROLLERS,
    providers: [...REPOSITORIES, ...POLICIES, ...USE_CASES, ProjectFacade],
    exports: [...EXPORT_USE_CASES, ...POLICIES],
})
export class ProjectModule {}
