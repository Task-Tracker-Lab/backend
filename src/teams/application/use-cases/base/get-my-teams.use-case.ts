import { ITeamsRepository } from '@core/teams/domain/repository';
import { TeamMemberMapper } from '@core/teams/application/mappers';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetMyTeamsUseCase {
    constructor(
        @Inject('ITeamsRepository')
        private readonly teamsRepo: ITeamsRepository,
        private readonly cfg: ConfigService,
    ) {}

    async execute(userId: string, pagination: Record<string, string>) {
        const teams = await this.teamsRepo.findByUser(userId, pagination);
        const cdn = this.getCdnBaseUrl();
        const data = teams.map((t) => TeamMemberMapper.toUserTeam(t, cdn));

        return {
            // TODO: реализовать полноценную пагинацию (total/limit/page/hasNextPage) для команд пользователя.
            items: data,
            meta: {
                total: data.length,
                totalPages: data.length ? 1 : 0,
                page: 1,
                limit: data.length,
                hasPrevPage: false,
                hasNextPage: false,
            },
        };
    }

    private getCdnBaseUrl(): string {
        const domain = this.cfg.get<string>('DOMAIN');
        const bucket = this.cfg.get<string>('S3_BUCKET_NAME');
        const endpoint = this.cfg.get<string>('S3_ENDPOINT');

        return domain ? `https://cdn.${domain}/${bucket}` : `${endpoint}/${bucket}`;
    }
}
