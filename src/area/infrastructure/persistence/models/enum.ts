import { STATE_CATEGORIES, STATE_TYPES } from '@core/area/domain/entities';
import { baseSchema } from '@shared/entities';

export const stateTypeEnum = baseSchema.enum('state_type', STATE_TYPES);
export const stateCategoryEnum = baseSchema.enum('state_category', STATE_CATEGORIES);
