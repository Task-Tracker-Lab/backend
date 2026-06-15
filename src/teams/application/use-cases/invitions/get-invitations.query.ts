import { ITeamsRepository } from '@core/teams/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';

@Injectable()
export class GetInvitationsQuery {
    private readonly TEAM_INVITES_KEY = (teamId: string) => `team:invites:${teamId}`;
    private readonly INVITES_KEY = (code: string) => `inv:code:${code}`;

    constructor(
        @Inject('ITeamsRepository') private readonly teamsRepo: ITeamsRepository,
        @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
    ) {}

    async execute(teamId: string, userId: string) {
        const team = await this.getTeamOrThrow(teamId);
        await this.ensureAdminPermissions(team.id, userId);

        const teamKey = this.TEAM_INVITES_KEY(team.id);
        const codes = await this.cacheService.getCollection(teamKey);
        if (!codes.length) {
            return {
                // TODO: реализовать полноценную пагинацию для инвайтов команды.
                items: [],
                meta: {
                    total: 0,
                    totalPages: 0,
                    page: 1,
                    limit: 0,
                    hasPrevPage: false,
                    hasNextPage: false,
                },
            };
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

        return {
            // TODO: реализовать полноценную пагинацию для инвайтов команды.
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

    private async getTeamOrThrow(teamId: string) {
        const team = await this.teamsRepo.findById(teamId);
        if (!team) {
            throw new BaseException(
                { code: 'TEAM_NOT_FOUND', message: 'Команда не найдена' },
                HttpStatus.NOT_FOUND,
            );
        }
        return team;
    }

    private async ensureAdminPermissions(teamId: string, userId: string) {
        const member = await this.teamsRepo.findMember(teamId, userId);
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
            throw new BaseException(
                { code: 'INSUFFICIENT_PERMISSIONS', message: 'У вас нет прав' },
                HttpStatus.FORBIDDEN,
            );
        }
    }
}
