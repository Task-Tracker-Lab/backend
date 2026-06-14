import { baseSchema } from '@shared/entities';
import { LAYOUTS, PROJECT_STATUSES, PROJECT_VISIBILITIES } from '@core/projects/domain/entities';

export const projectStatusEnum = baseSchema.enum('project_status', PROJECT_STATUSES);
export const projectVisibilityEnum = baseSchema.enum('project_visibility', PROJECT_VISIBILITIES);
export const layoutEnum = baseSchema.enum('layout_type', LAYOUTS);
