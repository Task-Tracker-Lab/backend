import { IssueErrorCodes, IssueErrorMessages } from '@core/issue/domain/errors';
import { IIssueRepository } from '@core/issue/domain/repositories';
import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class RestoreIssueUseCase {
    constructor(
        @Inject('IIssueRepository')
        private readonly issueRepo: IIssueRepository,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(id: string, slug: string, userId: string) {
        try {
            await this.projectPolicy.ensureProjectAccess(slug, userId, ['owner', 'admin']);

            const result = await this.issueRepo.restore(id, userId);

            if (!result) {
                throw new BaseException(
                    {
                        code: IssueErrorCodes.NOT_FOUND,
                        message: IssueErrorMessages[IssueErrorCodes.NOT_FOUND],
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            return {
                success: true,
                message: 'Задача успешно восстановлена',
            };
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }

            throw new BaseException(
                {
                    code: IssueErrorCodes.RESTORE_FAILED,
                    message: IssueErrorMessages[IssueErrorCodes.RESTORE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
