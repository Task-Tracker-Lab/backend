import { IIssueRepository } from '@core/issue/domain/repositories';
import { CheckVisibilityOrThrowQuery } from '@core/project/application/use-cases';
import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { Inject, Injectable } from '@nestjs/common';

import { IssueQueryDto } from '../../dtos';
import { IssueMapper } from '../../mappers';

@Injectable()
export class FindAllIssueQuery {
    constructor(
        @Inject('IIssueRepository')
        private readonly issueRepo: IIssueRepository,
        private readonly projectVisibility: CheckVisibilityOrThrowQuery,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(query: IssueQueryDto, userId: string) {
        const visibility = await this.projectVisibility.execute(query.slug);

        if (visibility === 'private') {
            await this.projectPolicy.ensureProjectAccess(query.slug, userId);
        }

        const issues = await this.issueRepo.find(query);

        return issues.map((issue) => IssueMapper.toResponseDto(issue));
    }
}
