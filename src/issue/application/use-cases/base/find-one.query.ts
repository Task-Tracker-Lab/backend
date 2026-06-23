import { IssueErrorCodes, IssueErrorMessages } from '@core/issue/domain/errors';
import { IIssueRepository } from '@core/issue/domain/repositories';
import { CheckVisibilityOrThrowQuery } from '@core/project/application/use-cases';
import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { IssueMapper } from '../../mappers';

@Injectable()
export class FindOneIssueQuery {
    constructor(
        @Inject('IIssueRepository')
        private readonly issueRepo: IIssueRepository,
        private readonly projectVisibility: CheckVisibilityOrThrowQuery,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(id: string, slug: string, userId: string) {
        const visibility = await this.projectVisibility.execute(slug);

        if (visibility === 'private') {
            await this.projectPolicy.ensureProjectAccess(slug, userId);
        }

        const issue = await this.issueRepo.findOne(id, userId);

        if (!issue) {
            throw new BaseException(
                {
                    code: IssueErrorCodes.NOT_FOUND,
                    message: IssueErrorMessages[IssueErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return IssueMapper.toResponseDto(issue);
    }
}
