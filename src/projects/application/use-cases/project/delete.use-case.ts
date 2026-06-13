import { ProjectErrorCodes, ProjectErrorMessages } from '@core/projects/domain/errors';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { IProjectRepository } from '@core/projects/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class DeleteProjectUseCase {
    constructor(
        @Inject('IProjectRepository')
        private readonly projectsRepo: IProjectRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    public async execute(slug: string, teamId: string, userId: string) {
        const { team } = await this.policy.ensureTeamAccess(teamId, userId, 'admin');

        const project = await this.projectsRepo.findBySlug(slug, team.id);
        if (!project) {
            throw new BaseException(
                {
                    code: ProjectErrorCodes.NOT_FOUND,
                    message: ProjectErrorMessages[ProjectErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const result = await this.projectsRepo.delete(team.id, project.id);

        if (!result) {
            throw new BaseException(
                {
                    code: ProjectErrorCodes.DELETE_FAILED,
                    message: ProjectErrorMessages[ProjectErrorCodes.DELETE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return {
            success: true,
            message: result
                ? `Проект ${project.name} успешно перемещен в корзину`
                : 'Не удалось удалить проект, попробуйте позже',
        };
    }
}
