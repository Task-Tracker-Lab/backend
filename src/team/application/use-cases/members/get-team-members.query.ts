import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseException } from '@shared/error';

import { TeamMemberMapper } from '../../../application/mappers';
import { ITeamRepository } from '../../../domain/repository';
import { TeamMembersQuery } from '../../dtos';

@Injectable()
export class GetTeamMembersQuery {
    constructor(
        @Inject('ITeamRepository')
        private readonly teamRepo: ITeamRepository,
        private readonly cfg: ConfigService,
    ) {}

    async execute(teamId: string, query?: TeamMembersQuery) {
        const team = await this.teamRepo.findById(teamId);

        if (!team) {
            throw new BaseException(
                { code: 'TEAM_NOT_FOUND', message: `Команда ${teamId} не найдена` },
                HttpStatus.NOT_FOUND,
            );
        }

        const { items, meta } = await this.teamRepo.findMembers(team.id, query);
        const data = TeamMemberMapper.toList(items, this.cfg);

        return {
            items: data,
            meta,
        };
    }
}
