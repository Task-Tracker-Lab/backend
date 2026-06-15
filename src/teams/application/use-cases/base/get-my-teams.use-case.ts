import { TeamMemberMapper } from '@core/teams/application/mappers';
import { ITeamsRepository } from '@core/teams/domain/repository';
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

        return teams.map((t) => TeamMemberMapper.toUserTeam(t, cdn));
    }

    private getCdnBaseUrl(): string {
        const domain = this.cfg.get<string>('DOMAIN');
        const bucket = this.cfg.get<string>('S3_BUCKET_NAME');
        const endpoint = this.cfg.get<string>('S3_ENDPOINT');

        return domain ? `https://cdn.${domain}/${bucket}` : `${endpoint}/${bucket}`;
    }
}
