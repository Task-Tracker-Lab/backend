import { ITeamsRepository } from '@core/teams/domain/repository';
import { TeamMemberMapper } from '@core/teams/application/mappers';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetTeamMembersQuery {
    constructor(
        @Inject('ITeamsRepository')
        private readonly teamsRepo: ITeamsRepository,
        private readonly cfg: ConfigService,
    ) {}

    async execute(teamId: string) {
        const team = await this.teamsRepo.findById(teamId);

        if (!team) {
            throw new BaseException(
                { code: 'TEAM_NOT_FOUND', message: `Команда ${teamId} не найдена` },
                HttpStatus.NOT_FOUND,
            );
        }
        const cdn = this.getCdnBaseUrl();
        const members = await this.teamsRepo.findMembers(team.id);
        const data = TeamMemberMapper.toList(members, cdn);

        return {
            // TODO: реализовать полноценную пагинацию для участников команды.
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
