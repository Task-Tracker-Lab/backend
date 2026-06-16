import { ProjectModule } from '@core/project';
import { forwardRef, Module } from '@nestjs/common';

import { AreaFacade } from './application/area.facade';
import { CONTROLLERS } from './application/controllers';
import { AreasUseCases, StatesUseCases } from './application/use-cases';
import { REPOSITORIES } from './infrastructure/persistence/repositories';

@Module({
    imports: [forwardRef(() => ProjectModule)],
    controllers: [...CONTROLLERS],
    providers: [...REPOSITORIES, ...StatesUseCases, ...AreasUseCases, AreaFacade],
    exports: [],
})
export class AreaModule {}
