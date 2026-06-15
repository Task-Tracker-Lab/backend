import type { states } from '@core/area/infrastructure/persistence/models';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type State = InferSelectModel<typeof states>;
export type NewState = InferInsertModel<typeof states>;
