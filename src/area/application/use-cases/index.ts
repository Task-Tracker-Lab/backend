import { AreasUseCases } from './areas';
import { StatesUseCases } from './states';

export * from './states';
export * from './areas';

export const USE_CASES = [...AreasUseCases, ...StatesUseCases];
