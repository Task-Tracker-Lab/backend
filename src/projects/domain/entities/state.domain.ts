import { projectStates } from '@shared/entities';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type ProjectState = InferSelectModel<typeof projectStates>;
export type NewProjectState = InferInsertModel<typeof projectStates>;
