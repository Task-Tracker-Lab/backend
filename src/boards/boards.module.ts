import { Module } from '@nestjs/common';
import { ProjectsModule } from '@core/projects';
import { BoardsRepository } from './infrastructure/persistence/repositories';
import { BoardsController, ColumnsController, ViewsController } from './application/controller';
import { BoardsFacade } from './application/boards.facade';
import { BoardQueries, BoardUseCases } from './application/use-cases';
import { BoardAccessPolicy } from './domain/policy';

const REPOSITORY = {
    provide: 'IBoardsRepository',
    useClass: BoardsRepository,
};

@Module({
    imports: [ProjectsModule],
    controllers: [BoardsController, ColumnsController, ViewsController],
    providers: [REPOSITORY, BoardAccessPolicy, BoardsFacade, ...BoardUseCases, ...BoardQueries],
})
export class BoardsModule {}
