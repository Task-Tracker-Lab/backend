import { Injectable } from '@nestjs/common';

import { ProjectMapper } from '../../mappers';

import { FindProjectQuery } from './find-one.query';

@Injectable()
export class GetProjectDetailQuery {
    constructor(private readonly findProjectQuery: FindProjectQuery) {}

    public async execute(slug: string, teamId: string, userId?: string, token?: string) {
        const { project, member } = await this.findProjectQuery.execute(
            slug,
            teamId,
            'viewer',
            token,
            userId,
        );

        return ProjectMapper.toDetailResponse(project, member);
    }
}
