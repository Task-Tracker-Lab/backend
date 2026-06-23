import { ProjectErrorCodes, ProjectErrorMessages } from '@core/project/domain/errors';
import { IProjectRepository } from '@core/project/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class CheckVisibilityOrThrowQuery {
    constructor(
        @Inject('IProjectRepository')
        private readonly projectsRepo: IProjectRepository,
    ) {}
    async execute(slug: string) {
        const result = await this.projectsRepo.checkVisibility(slug);

        if (!result) {
            throw new BaseException(
                {
                    code: ProjectErrorCodes.NOT_FOUND,
                    message: ProjectErrorMessages[ProjectErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return result.visibility;
    }
}
