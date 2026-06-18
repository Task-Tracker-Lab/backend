import { createMongoAbility, RawRuleOf } from '@casl/ability';
import { RawMemberRow } from '@core/teams/domain/repository';
import { Injectable } from '@nestjs/common';
import { Subject } from '@shared/authorization/types/subject.enum';
import { ROLE_PRIORITY } from '@shared/constants';

import { ROLE_PERMISSIONS_MAP } from './permissions';
import { AppAbility } from './types/app-ability.type';

import type { ConditionValue } from './types/permission-rule.interface';

@Injectable()
export class AbilityFactory {
    constructor() {}

    createForTeamMember(member: RawMemberRow) {
        const role = member.role;
        const permissions = ROLE_PERMISSIONS_MAP[role];
        const rolePriority = ROLE_PRIORITY[role];

        const rules: RawRuleOf<AppAbility>[] = permissions.map((permission) => {
            const conditions = this.resolveConditions(permission.conditions, member.userId);

            if (
                role !== 'owner' &&
                (permission.subject === Subject.TEAM_MEMBER || permission.subject === Subject.ROLE)
            ) {
                return {
                    action: permission.action,
                    subject: permission.subject,
                    conditions: {
                        ...conditions,
                        priority: { $lt: rolePriority },
                    },
                };
            }

            return {
                action: permission.action,
                subject: permission.subject,
                conditions,
            };
        });

        return createMongoAbility<AppAbility>(rules);
    }

    private resolveConditions(
        conditions: Record<string, ConditionValue> | undefined,
        userId: string,
    ) {
        if (!conditions) {
            return {};
        }

        const result: Record<string, string | number> = {};

        for (const [key, value] of Object.entries(conditions)) {
            result[key] = value === '$currentUser' ? userId : value;
        }

        return result;
    }
}
