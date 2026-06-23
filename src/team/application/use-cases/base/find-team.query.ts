import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseException } from '@shared/error';
import { ImageHelper } from '@shared/utils';

import { ITeamRepository } from '../../../domain/repository';

@Injectable()
export class FindTeamQuery {
    constructor(
        @Inject('ITeamRepository')
        private readonly repository: ITeamRepository,
        private readonly cfg: ConfigService,
    ) {}

    async execute(teamId: string) {
        const team = await this.repository.findById(teamId);

        if (!team) {
            throw new BaseException(
                {
                    code: 'NOT_FOUND',
                    message: 'Команда не найдена',
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const { avatarUrl, coverUrl, ...other } = team;

        const avatar = ImageHelper.responsive(this.cfg, avatarUrl);
        const cover = ImageHelper.responsive(this.cfg, coverUrl);

        return {
            ...other,
            cover,
            avatar,
        };
    }
}
