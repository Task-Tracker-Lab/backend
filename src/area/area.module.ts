import { ProjectModule } from '@core/project';
import { forwardRef, Module } from '@nestjs/common';

import { AreaFacade } from './application/area.facade';
import { CONTROLLERS } from './application/controllers';
import { GetAreaQuery, GetStateQuery, USE_CASES } from './application/use-cases';
import { REPOSITORIES } from './infrastructure/persistence/repositories';

@Module({
    imports: [forwardRef(() => ProjectModule)],
    controllers: [...CONTROLLERS],
    providers: [...REPOSITORIES, ...USE_CASES, AreaFacade],
    exports: [GetAreaQuery, GetStateQuery],
})
export class AreaModule {}
