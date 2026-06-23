import { IssueErrorCodes, IssueErrorMessages } from '@core/issue/domain/errors';
import { IIssueRepository } from '@core/issue/domain/repositories';
import { ProjectAccessPolicy } from '@core/project/domain/policy';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class DeleteIssueUseCase {
    constructor(
        @Inject('IIssueRepository')
        private readonly issueRepo: IIssueRepository,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(id: string, slug: string, userId: string) {
        try {
            await this.projectPolicy.ensureProjectAccess(slug, userId, ['owner', 'admin']);

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

            const result = await this.issueRepo.delete(id, userId);

            return {
                success: result,
                message: result
                    ? 'Задача успешно удалена'
                    : 'Не удалось удалить задачу: запись не найдена или уже удалена',
            };
        } catch (e) {
            if (e instanceof BaseException) {
                throw e;
            }

            throw new BaseException(
                {
                    code: IssueErrorCodes.DELETE_FAILED,
                    message: IssueErrorMessages[IssueErrorCodes.DELETE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
