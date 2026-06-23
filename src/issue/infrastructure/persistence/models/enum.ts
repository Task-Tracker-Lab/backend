import { baseSchema } from '@shared/entities';

import { PRIORITY, ISSUE_TYPE } from '../../../domain/entities/enum';

export const priorityEnum = baseSchema.enum('priority', PRIORITY);

export const issueTypeEnum = baseSchema.enum('issue_type', ISSUE_TYPE);
