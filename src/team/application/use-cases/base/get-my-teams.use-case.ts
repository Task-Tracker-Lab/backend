import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TeamMemberMapper } from '../../../application/mappers';
import { ITeamRepository } from '../../../domain/repository';

@Injectable()
export class GetMyTeamsUseCase {
    constructor(
        @Inject('ITeamRepository')
        private readonly teamRepo: ITeamRepository,
        private readonly cfg: ConfigService,
    ) {}

    async execute(userId: string) {
        const teams = await this.teamRepo.findByUser(userId);
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
