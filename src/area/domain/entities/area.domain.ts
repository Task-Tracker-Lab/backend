import { areas } from '@core/area/infrastructure/persistence/models';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type Area = InferSelectModel<typeof areas>;
export type NewArea = InferInsertModel<typeof areas>;
