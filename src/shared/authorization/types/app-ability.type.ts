import type { ForcedSubject, MongoAbility } from '@casl/ability';
import type { Action } from '@shared/authorization/types/action.enum';
import type { Subject } from '@shared/authorization/types/subject.enum';

export type AppAbility = MongoAbility<[Action, Subject | ForcedSubject<Subject>]>;
