import { AreaQueues } from '@core/area/domain/enums';
import { ProjectQueues } from '@core/project/domain/enums';
import { TeamModule } from '@core/team';
import { UserModule } from '@core/user';
import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';

import { CONTROLLERS } from './application/controllers';
import { ProjectFacade } from './application/project.facade';
import { USE_CASES, EXPORT_USE_CASES } from './application/use-cases';
import { POLICIES } from './domain/policy';
import { REPOSITORIES } from './infrastructure/persistence/repositories';
import { ProjectProcessor } from './infrastructure/workers/project.processor';

@Module({
    imports: [
        BullModule.registerQueue(
            { name: ProjectQueues.PROJECT_WORKSPACE },
            { name: AreaQueues.AREA_WORKSPACE },
        ),
        UserModule,
        forwardRef(() => TeamModule),
    ],
    controllers: CONTROLLERS,
    providers: [...REPOSITORIES, ...POLICIES, ...USE_CASES, ProjectFacade, ProjectProcessor],
    exports: [...EXPORT_USE_CASES, ...POLICIES],
})
export class ProjectModule {}
