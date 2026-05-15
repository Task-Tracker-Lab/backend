import { TeamMemberMapper } from '@core/teams/application/mappers';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';

@Injectable()
export class GetMyInvitesUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
    ) {}

    async execute(email: string) {
        const userKey = `user:invites:${email.toLowerCase()}`;
        const codes = await this.cacheService.getCollection(userKey);

        if (!codes.length) return [];

        const inviteKeys = codes.map((c) => `inv:code:${c}`);
        const results = await this.cacheService.getMany(inviteKeys);

        const { activeInvites, expiredCodes } = results.reduce(
            (acc, raw, i) => {
                if (raw) {
                    acc.activeInvites.push(TeamMemberMapper.toPublicInvite(raw, codes[i]));
                } else {
                    acc.expiredCodes.push(codes[i]);
                }
                return acc;
            },
            { activeInvites: [], expiredCodes: [] },
        );

        if (expiredCodes.length > 0) {
            this.cacheService.removeManyFromCollection(userKey, expiredCodes).catch((err) => {
                console.error('Failed to cleanup expired invites:', err);
            });
        }

        return activeInvites;
    }
}
