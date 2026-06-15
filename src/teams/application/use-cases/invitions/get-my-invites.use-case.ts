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

        if (!codes.length) {
            return {
                // TODO: реализовать полноценную пагинацию для инвайтов пользователя.
                items: [],
                meta: {
                    total: 0,
                    totalPages: 0,
                    page: 1,
                    limit: 10,
                    hasPrevPage: false,
                    hasNextPage: false,
                },
            };
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

        return {
            items: active,
            meta: {
                total: active.length,
                totalPages: active.length ? 1 : 0,
                page: 1,
                limit: active.length,
                hasPrevPage: false,
                hasNextPage: false,
            },
        };
    }
}
