import { Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';

import { TeamMemberMapper } from '../../../application/mappers';

@Injectable()
export class GetMyInvitesUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
    ) {}

    async execute(email: string) {
        const userKey = `user:invites:${email.toLowerCase()}`;
        const codes = await this.cacheService.getCollection(userKey);

        if (!codes.length) {
            return [];
        }

        const inviteKeys = codes.map((c) => `inv:code:${c}`);
        const results = await this.cacheService.getMany(inviteKeys);
        const { active, expired } = results.reduce(
            (acc: { active: any[]; expired: string[] }, raw, i) => {
                const code = codes[i];
                if (!code) {
                    return acc;
                }

                if (raw) {
                    acc.active.push(TeamMemberMapper.toPublicInvite(raw, code));
                } else {
                    acc.expired.push(code);
                }
                return acc;
            },
            { active: [], expired: [] },
        );

        if (expired.length > 0) {
            this.cacheService.removeManyFromCollection(userKey, expired).catch((err) => {
                console.error('Failed to cleanup expired invites:', err);
            });
        }

        return active;
    }
}
