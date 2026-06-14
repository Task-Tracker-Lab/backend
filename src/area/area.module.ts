import { forwardRef, Module } from '@nestjs/common';
import { REPOSITORIES } from './infrastructure/persistence/repositories';
import { AreaFacade } from './application/area.facade';
import { AreasUseCases, StatesUseCases } from './application/use-cases';
import { CONTROLLERS } from './application/controllers';
import { ProjectsModule } from '@core/projects';

@Module({
    imports: [forwardRef(() => ProjectsModule)],
    controllers: [...CONTROLLERS],
    providers: [...REPOSITORIES, ...StatesUseCases, ...AreasUseCases, AreaFacade],
    exports: [],
})
export class AreaModule {}
