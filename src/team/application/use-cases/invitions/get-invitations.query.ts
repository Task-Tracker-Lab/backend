import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { AbilityFactory } from '@shared/authorization/ability.factory';
import { Action } from '@shared/authorization/types/action.enum';
import { Subject } from '@shared/authorization/types/subject.enum';
import { BaseException } from '@shared/error';

import { ITeamRepository, RawMemberRow } from '../../../domain/repository';

@Injectable()
export class GetInvitationsQuery {
    private readonly TEAM_INVITES_KEY = (teamId: string) => `team:invites:${teamId}`;
    private readonly INVITES_KEY = (code: string) => `inv:code:${code}`;

    constructor(
        @Inject('ITeamRepository') private readonly teamRepo: ITeamRepository,
        @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async execute(teamId: string, userId: string) {
        const member = await this.teamRepo.findMember(teamId, userId);
        if (!member) {
            throw new BaseException(
                {
                    code: 'TEAM_NOT_FOUND_OR_FORBIDDEN',
                    message: `У вас нет прав или команда не найдена`,
                },
                HttpStatus.FORBIDDEN,
            );
        }

        this.validateAccess(member);

        const teamKey = this.TEAM_INVITES_KEY(teamId);
        const codes = await this.cacheService.getCollection(teamKey);

        if (!codes.length) {
            return [];
        }

        const results = await this.cacheService.getMany(codes.map(this.INVITES_KEY));

        const { active, expired } = results.reduce(
            (acc: { active: any[]; expired: string[] }, raw, i) => {
                const code = codes[i];
                if (!code) {
                    return acc;
                }

                if (raw) {
                    acc.active.push({ code, ...JSON.parse(raw) });
                } else {
                    acc.expired.push(code);
                }
                return acc;
            },
            { active: [], expired: [] },
        );

        if (expired.length > 0) {
            this.cacheService
                .removeManyFromCollection(teamKey, expired)
                .catch((e) => console.error('Cleanup error:', e));
        }

        return active;
    }

    private validateAccess(member: RawMemberRow) {
        const ability = this.abilityFactory.createForTeamMember(member);
        const isAllow = ability.can(Action.READ, Subject.INVITE);

        if (!isAllow) {
            throw new BaseException(
                { code: 'INSUFFICIENT_PERMISSIONS', message: 'У вас нет прав' },
                HttpStatus.FORBIDDEN,
            );
        }
    }
}
