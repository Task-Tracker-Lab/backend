import { CreateAreaUseCase } from './create.use-case';
import { DeleteAreaUseCase } from './delete.use-case';
import { GetAreasQuery } from './get-all.query';
import { GetAreaQuery } from './get-one.query';
import { UpdateAreaUseCase } from './update.use-case';

export * from './create.use-case';
export * from './delete.use-case';
export * from './get-all.query';
export * from './get-one.query';
export * from './update.use-case';

export const AreasUseCases = [
    CreateAreaUseCase,
    DeleteAreaUseCase,
    UpdateAreaUseCase,
    GetAreaQuery,
    GetAreasQuery,
];
