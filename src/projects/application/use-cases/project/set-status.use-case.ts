import { PROJECT_STATUSES, type ProjectStatus } from '@core/projects/domain/entities';
import { ProjectErrorCodes, ProjectErrorMessages } from '@core/projects/domain/errors';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { IProjectRepository } from '@core/projects/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class SetProjectStatusUseCase {
    constructor(
        @Inject('IProjectRepository')
        private readonly projectsRepo: IProjectRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    public async execute(slug: string, teamId: string, userId: string, status: ProjectStatus) {
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

        if (project.status === status) {
            throw new BaseException(
                {
                    code:
                        status === PROJECT_STATUSES[1]
                            ? ProjectErrorCodes.ALREADY_ARCHIVED
                            : ProjectErrorCodes.ALREADY_ACTIVE,
                    message:
                        status === PROJECT_STATUSES[1]
                            ? ProjectErrorMessages[ProjectErrorCodes.ALREADY_ARCHIVED]
                            : ProjectErrorMessages[ProjectErrorCodes.ALREADY_ACTIVE],
                },
                HttpStatus.CONFLICT,
            );
        }

        //  if (status === ProjectStatus.Archived) {
        //      const activeTasksCount = await this.projectsRepo.countActiveTasks(project.id);
        //      if (activeTasksCount > 0) {
        //          throw new BaseException(
        //              {
        //                  code: ProjectErrorCodes.CANNOT_ARCHIVE_WITH_ACTIVE_TASKS,
        //                  message:
        //                      ProjectErrorMessages[
        //                          ProjectErrorCodes.CANNOT_ARCHIVE_WITH_ACTIVE_TASKS
        //                      ],
        //              },
        //              HttpStatus.CONFLICT,
        //          );
        //      }
        //  }

        const result = await this.projectsRepo.update(team.id, project.id, { status });

        if (!result) {
            throw new BaseException(
                {
                    code: 'STATUS_UPDATE_FAILED',
                    message: 'Не удалось обновить статус проекта',
                    details: [{ target: 'status', value: status }],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        const messages: Record<string, string> = {
            [PROJECT_STATUSES[0]]: `Проект «${project.name}» восстановлен`,
            [PROJECT_STATUSES[1]]: `Проект «${project.name}» архивирован`,
            [PROJECT_STATUSES[2]]: `Проект «${project.name}» сохранен как шаблон`,
            [PROJECT_STATUSES[3]]: `Проект «${project.name}» удален`,
        };

        return {
            success: result,
            message: messages[status] || `Статус проекта «${project.name}» изменен`,
        };
    }
}
