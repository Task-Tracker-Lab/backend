import { subject } from '@casl/ability';
import { Action } from '@shared/authorization/types/action.enum';
import { Subject } from '@shared/authorization/types/subject.enum';
import { ROLE_PRIORITY } from '@shared/constants';
import { describe, expect } from 'vitest';

import { AbilityFactory } from './ability.factory';

import type { RawMemberRow } from '../../team/domain/repository';
import type { TeamRole } from '../../team/infrastructure/persistence/models';

describe('AuthorizationService - Permissions Matrix', () => {
    const findTeamMemberMock = {
        execute: vi.fn(),
    };

    const factory = new AbilityFactory();

    const createAbilityFor = (role: TeamRole) => {
        const mockMember: RawMemberRow = {
            userId: '1',
            role,
            status: 'active',
            joinedAt: null,
            firstName: null,
            lastName: null,
            middleName: null,
            avatarUrl: null,
        };
        vi.spyOn(findTeamMemberMock, 'execute').mockResolvedValue(mockMember);
        return factory.createForTeamMember(mockMember);
    };

    describe('Role: Owner', () => {
        it('should MANAGE TEAM', () => {
            const ability = createAbilityFor('owner');

            expect(ability.can(Action.MANAGE, Subject.TEAM)).toBeTruthy();
            expect(ability.can(Action.CREATE, Subject.TEAM)).toBeTruthy();
            expect(ability.can(Action.READ, Subject.TEAM)).toBeTruthy();
            expect(ability.can(Action.UPDATE, Subject.TEAM)).toBeTruthy();
            expect(ability.can(Action.DELETE, Subject.TEAM)).toBeTruthy();
        });

        it('should MANAGE TEAM_MEMBER with any priority', () => {
            const ability = createAbilityFor('owner');

            expect(ability.can(Action.MANAGE, Subject.TEAM_MEMBER)).toBeTruthy();
            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['owner'] }),
                ),
            ).toBeTruthy();
            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['admin'] }),
                ),
            ).toBeTruthy();
            expect(
                ability.can(
                    Action.MANAGE,

                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['member'] }),
                ),
            ).toBeTruthy();

            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['viewer'] }),
                ),
            ).toBeTruthy();
        });

        it('should MANAGE INVITE', () => {
            const ability = createAbilityFor('owner');

            expect(ability.can(Action.MANAGE, Subject.INVITE)).toBeTruthy();
            expect(ability.can(Action.CREATE, Subject.INVITE)).toBeTruthy();
            expect(ability.can(Action.READ, Subject.INVITE)).toBeTruthy();
            expect(ability.can(Action.UPDATE, Subject.INVITE)).toBeTruthy();
            expect(ability.can(Action.DELETE, Subject.INVITE)).toBeTruthy();
        });

        it('should MANAGE PROJECT', () => {
            const ability = createAbilityFor('owner');

            expect(ability.can(Action.MANAGE, Subject.PROJECT)).toBeTruthy();
            expect(ability.can(Action.CREATE, Subject.PROJECT)).toBeTruthy();
            expect(ability.can(Action.READ, Subject.PROJECT)).toBeTruthy();
            expect(ability.can(Action.UPDATE, Subject.PROJECT)).toBeTruthy();
            expect(ability.can(Action.DELETE, Subject.PROJECT)).toBeTruthy();
        });

        it('should MANAGE TASK', () => {
            const ability = createAbilityFor('owner');

            expect(ability.can(Action.MANAGE, Subject.TASK)).toBeTruthy();
            expect(ability.can(Action.CREATE, Subject.TASK)).toBeTruthy();
            expect(ability.can(Action.READ, Subject.TASK)).toBeTruthy();
            expect(ability.can(Action.UPDATE, Subject.TASK)).toBeTruthy();
            expect(ability.can(Action.DELETE, Subject.TASK)).toBeTruthy();
        });

        it('should MANAGE ROLE', () => {
            const ability = createAbilityFor('owner');

            expect(ability.can(Action.MANAGE, Subject.ROLE)).toBeTruthy();
            expect(ability.can(Action.CREATE, Subject.ROLE)).toBeTruthy();
            expect(ability.can(Action.READ, Subject.ROLE)).toBeTruthy();
            expect(ability.can(Action.UPDATE, Subject.ROLE)).toBeTruthy();
            expect(
                ability.can(
                    Action.UPDATE,
                    subject(Subject.ROLE, { priority: ROLE_PRIORITY['owner'] }),
                ),
            ).toBeTruthy();
            expect(ability.can(Action.DELETE, Subject.ROLE)).toBeTruthy();
        });

        it('should MANAGE BILLING', () => {
            const ability = createAbilityFor('owner');

            expect(ability.can(Action.MANAGE, Subject.BILLING)).toBeTruthy();
            expect(ability.can(Action.CREATE, Subject.BILLING)).toBeTruthy();
            expect(ability.can(Action.READ, Subject.BILLING)).toBeTruthy();
            expect(ability.can(Action.UPDATE, Subject.BILLING)).toBeTruthy();
            expect(ability.can(Action.DELETE, Subject.BILLING)).toBeTruthy();
        });
    });

    describe('Role: Admin', () => {
        it('should READ and UPDATE TEAM, but not DELETE', () => {
            const ability = createAbilityFor('admin');

            expect(ability.can(Action.READ, Subject.TEAM)).toBeTruthy();
            expect(ability.can(Action.UPDATE, Subject.TEAM)).toBeTruthy();

            expect(ability.can(Action.DELETE, Subject.TEAM)).toBeFalsy();
            expect(ability.can(Action.MANAGE, Subject.TEAM)).toBeFalsy();
        });

        it('should MANAGE TEAM_MEMBER with lower priority only (not higher or the same role)', () => {
            const ability = createAbilityFor('admin');

            // admin can manage members with lower role priority
            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['member'] }),
                ),
            ).toBeTruthy();
            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['viewer'] }),
                ),
            ).toBeTruthy();

            // cannot manage members with the same or higher role priority
            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['owner'] }),
                ),
            ).toBeFalsy();
            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['admin'] }),
                ),
            ).toBeFalsy();
        });

        it('should MANAGE INVITE', () => {
            const ability = createAbilityFor('admin');

            expect(ability.can(Action.MANAGE, Subject.INVITE)).toBeTruthy();
            expect(ability.can(Action.CREATE, Subject.INVITE)).toBeTruthy();
            expect(ability.can(Action.READ, Subject.INVITE)).toBeTruthy();
            expect(ability.can(Action.UPDATE, Subject.INVITE)).toBeTruthy();
            expect(ability.can(Action.DELETE, Subject.INVITE)).toBeTruthy();
        });

        it('should MANAGE PROJECT', () => {
            const ability = createAbilityFor('admin');

            expect(ability.can(Action.MANAGE, Subject.PROJECT)).toBeTruthy();
            expect(ability.can(Action.CREATE, Subject.PROJECT)).toBeTruthy();
            expect(ability.can(Action.READ, Subject.PROJECT)).toBeTruthy();
            expect(ability.can(Action.UPDATE, Subject.PROJECT)).toBeTruthy();
            expect(ability.can(Action.DELETE, Subject.PROJECT)).toBeTruthy();
        });

        it('should MANAGE TASK', () => {
            const ability = createAbilityFor('admin');

            expect(ability.can(Action.MANAGE, Subject.TASK)).toBeTruthy();
            expect(ability.can(Action.CREATE, Subject.TASK)).toBeTruthy();
            expect(ability.can(Action.READ, Subject.TASK)).toBeTruthy();
            expect(ability.can(Action.UPDATE, Subject.TASK)).toBeTruthy();
            expect(ability.can(Action.DELETE, Subject.TASK)).toBeTruthy();
        });

        it('should MANAGE ROLE', () => {
            const ability = createAbilityFor('admin');

            expect(ability.can(Action.MANAGE, Subject.ROLE)).toBeTruthy();
            expect(ability.can(Action.CREATE, Subject.ROLE)).toBeTruthy();
            expect(ability.can(Action.READ, Subject.ROLE)).toBeTruthy();
            expect(ability.can(Action.UPDATE, Subject.ROLE)).toBeTruthy();
            expect(ability.can(Action.DELETE, Subject.ROLE)).toBeTruthy();
        });

        it('should NOT have access to CREATE/UPDATE-TO ROLE with the same or higher priority', () => {
            const ability = createAbilityFor('admin');

            expect(
                ability.can(
                    Action.CREATE,
                    subject(Subject.ROLE, { priority: ROLE_PRIORITY['member'] }),
                ),
            ).toBeTruthy();
            expect(
                ability.can(
                    Action.CREATE,
                    subject(Subject.ROLE, { priority: ROLE_PRIORITY['admin'] }),
                ),
            ).toBeFalsy();
            expect(
                ability.can(
                    Action.CREATE,
                    subject(Subject.ROLE, { priority: ROLE_PRIORITY['owner'] }),
                ),
            ).toBeFalsy();

            expect(
                ability.can(
                    Action.UPDATE,
                    subject(Subject.ROLE, { priority: ROLE_PRIORITY['member'] }),
                ),
            ).toBeTruthy();
            expect(
                ability.can(
                    Action.CREATE,
                    subject(Subject.ROLE, { priority: ROLE_PRIORITY['admin'] }),
                ),
            ).toBeFalsy();
            expect(
                ability.can(
                    Action.CREATE,
                    subject(Subject.ROLE, { priority: ROLE_PRIORITY['owner'] }),
                ),
            ).toBeFalsy();
        });

        it('should have only READ access to BILLING', () => {
            const ability = createAbilityFor('admin');

            expect(ability.can(Action.READ, Subject.BILLING)).toBeTruthy();

            expect(ability.can(Action.MANAGE, Subject.BILLING)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.BILLING)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.BILLING)).toBeFalsy();
        });
    });

    describe('Role: Member', () => {
        it('should MANAGE own TASK only', () => {
            const ability = createAbilityFor('member');

            expect(
                ability.can(Action.MANAGE, subject(Subject.TASK, { ownerId: '1' })),
            ).toBeTruthy();
            expect(ability.can(Action.MANAGE, subject(Subject.TASK, { ownerId: '2' }))).toBeFalsy();
        });

        it('should NOT have access to TEAM', () => {
            const ability = createAbilityFor('member');

            expect(ability.can(Action.MANAGE, Subject.TEAM)).toBeFalsy();
            expect(ability.can(Action.READ, Subject.TEAM)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.TEAM)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.TEAM)).toBeFalsy();
        });

        it('should NOT have access to TEAM_MEMBER', () => {
            const ability = createAbilityFor('member');

            expect(ability.can(Action.MANAGE, Subject.TEAM_MEMBER)).toBeFalsy();
            expect(
                ability.can(Action.MANAGE, subject(Subject.TEAM_MEMBER, { priority: 0 })),
            ).toBeFalsy();
        });

        it('should NOT have access to INVITE', () => {
            const ability = createAbilityFor('member');

            expect(ability.can(Action.MANAGE, Subject.INVITE)).toBeFalsy();
            expect(ability.can(Action.CREATE, Subject.INVITE)).toBeFalsy();
            expect(ability.can(Action.READ, Subject.INVITE)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.INVITE)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.INVITE)).toBeFalsy();
        });

        it('should NOT have access to ROLE', () => {
            const ability = createAbilityFor('member');

            expect(ability.can(Action.MANAGE, Subject.ROLE)).toBeFalsy();
            expect(ability.can(Action.CREATE, Subject.ROLE)).toBeFalsy();
            expect(ability.can(Action.READ, Subject.ROLE)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.ROLE)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.ROLE)).toBeFalsy();
        });

        it('should have only READ access to PROJECT', () => {
            const ability = createAbilityFor('member');

            expect(ability.can(Action.READ, Subject.PROJECT)).toBeTruthy();

            expect(ability.can(Action.MANAGE, Subject.PROJECT)).toBeFalsy();
            expect(ability.can(Action.CREATE, Subject.PROJECT)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.PROJECT)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.PROJECT)).toBeFalsy();
        });

        it('should NOT have access to BILLING', () => {
            const ability = createAbilityFor('member');

            expect(ability.can(Action.MANAGE, Subject.BILLING)).toBeFalsy();
            expect(ability.can(Action.CREATE, Subject.BILLING)).toBeFalsy();
            expect(ability.can(Action.READ, Subject.BILLING)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.BILLING)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.BILLING)).toBeFalsy();
        });
    });

    describe('Role: Viewer', () => {
        it('should have only READ access to TEAM', () => {
            const ability = createAbilityFor('viewer');

            expect(ability.can(Action.READ, Subject.TEAM)).toBeTruthy();

            expect(ability.can(Action.CREATE, Subject.TEAM)).toBeFalsy();
            expect(ability.can(Action.MANAGE, Subject.TEAM)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.TEAM)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.TEAM)).toBeFalsy();
        });

        it('should have only READ access to PROJECT', () => {
            const ability = createAbilityFor('viewer');

            expect(ability.can(Action.READ, Subject.PROJECT)).toBeTruthy();

            expect(ability.can(Action.MANAGE, Subject.PROJECT)).toBeFalsy();
            expect(ability.can(Action.CREATE, Subject.PROJECT)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.PROJECT)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.PROJECT)).toBeFalsy();
        });

        it('should have NOT access to ROLE', () => {
            const ability = createAbilityFor('viewer');

            expect(ability.can(Action.READ, Subject.ROLE)).toBeFalsy();
            expect(ability.can(Action.MANAGE, Subject.ROLE)).toBeFalsy();
            expect(ability.can(Action.CREATE, Subject.ROLE)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.ROLE)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.ROLE)).toBeFalsy();
        });

        it('should have NOT access to INVITE', () => {
            const ability = createAbilityFor('viewer');

            expect(ability.can(Action.READ, Subject.INVITE)).toBeFalsy();
            expect(ability.can(Action.MANAGE, Subject.INVITE)).toBeFalsy();
            expect(ability.can(Action.CREATE, Subject.INVITE)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.INVITE)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.INVITE)).toBeFalsy();
        });

        it('should have NOT access to BILLING', () => {
            const ability = createAbilityFor('viewer');

            expect(ability.can(Action.READ, Subject.BILLING)).toBeFalsy();
            expect(ability.can(Action.MANAGE, Subject.BILLING)).toBeFalsy();
            expect(ability.can(Action.CREATE, Subject.BILLING)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.BILLING)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.BILLING)).toBeFalsy();
        });

        it('should have only READ access to TEAM_MEMBER', () => {
            const ability = createAbilityFor('viewer');

            expect(ability.can(Action.READ, Subject.TEAM_MEMBER)).toBeTruthy();

            expect(ability.can(Action.MANAGE, Subject.TEAM_MEMBER)).toBeFalsy();
            expect(ability.can(Action.CREATE, Subject.TEAM_MEMBER)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.TEAM_MEMBER)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.TEAM_MEMBER)).toBeFalsy();
        });

        it('should have only READ access to TASK (even own)', () => {
            const ability = createAbilityFor('viewer');

            expect(ability.can(Action.READ, Subject.TASK)).toBeTruthy();

            expect(ability.can(Action.MANAGE, Subject.TASK)).toBeFalsy();
            expect(ability.can(Action.CREATE, Subject.TASK)).toBeFalsy();
            expect(ability.can(Action.UPDATE, Subject.TASK)).toBeFalsy();
            expect(ability.can(Action.DELETE, Subject.TASK)).toBeFalsy();

            expect(ability.can(Action.MANAGE, subject(Subject.TASK, { ownerId: '1' }))).toBeFalsy();
            expect(ability.can(Action.UPDATE, subject(Subject.TASK, { ownerId: '1' }))).toBeFalsy();
            expect(ability.can(Action.DELETE, subject(Subject.TASK, { ownerId: '1' }))).toBeFalsy();
            expect(ability.can(Action.CREATE, subject(Subject.TASK, { ownerId: '1' }))).toBeFalsy();
        });
    });

    describe('Role Priority - Admin cannot manage higher or equal priority members', () => {
        it('should NOT allow admin to manage owner (priority 3 > 2)', () => {
            const ability = createAbilityFor('admin');

            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['owner'] }),
                ),
            ).toBeFalsy();
        });

        it('should NOT allow admin to manage another admin (priority 2 === 2)', () => {
            const ability = createAbilityFor('admin');

            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['admin'] }),
                ),
            ).toBeFalsy();
        });

        it('should allow admin to manage member (priority 1 < 2)', () => {
            const ability = createAbilityFor('admin');

            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['member'] }),
                ),
            ).toBeTruthy();
        });

        it('should allow admin to manage viewer (priority 0 < 2)', () => {
            const ability = createAbilityFor('admin');

            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['viewer'] }),
                ),
            ).toBeTruthy();
        });
    });

    describe('Role Priority - Owner can manage all members', () => {
        it('should allow owner to manage owner (priority 3 = 3)', () => {
            const ability = createAbilityFor('owner');

            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['owner'] }),
                ),
            ).toBeTruthy();
        });

        it('should allow owner to manage admin (priority 2 < 3)', () => {
            const ability = createAbilityFor('owner');

            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['admin'] }),
                ),
            ).toBeTruthy();
        });

        it('should allow owner to manage member (priority 1 < 3)', () => {
            const ability = createAbilityFor('owner');

            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['member'] }),
                ),
            ).toBeTruthy();
        });

        it('should allow owner to manage viewer (priority 0 < 3)', () => {
            const ability = createAbilityFor('owner');

            expect(
                ability.can(
                    Action.MANAGE,
                    subject(Subject.TEAM_MEMBER, { priority: ROLE_PRIORITY['viewer'] }),
                ),
            ).toBeTruthy();
        });
    });

    describe('Fallback to viewer role', () => {
        it('should grant no permissions when member is not found (defaults to viewer)', () => {
            vi.spyOn(findTeamMemberMock, 'execute').mockResolvedValue(null);
            const ability = createAbilityFor('viewer');

            expect(ability.can(Action.MANAGE, Subject.TEAM)).toBeFalsy();
            expect(ability.can(Action.MANAGE, Subject.TEAM_MEMBER)).toBeFalsy();
            expect(ability.can(Action.MANAGE, Subject.INVITE)).toBeFalsy();
            expect(ability.can(Action.MANAGE, Subject.ROLE)).toBeFalsy();
            expect(ability.can(Action.MANAGE, subject(Subject.TASK, { ownerId: '1' }))).toBeFalsy();
        });
    });
});
