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

        return teams.map((t) => TeamMemberMapper.toUserTeam(t, this.cfg));
    }
}
