import { AreaErrorCodes, AreaErrorMessages } from '@core/area/domain/errors';
import { IAreaRepository } from '@core/area/domain/repository';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class DeleteAreaUseCase {
    constructor(
        @Inject('IAreaRepository')
        private readonly areaRepo: IAreaRepository,
        private readonly projectPolicy: ProjectAccessPolicy,
    ) {}

    async execute(slug: string, key: string, userId: string) {
        try {
            const { project } = await this.projectPolicy.ensureProjectAccess(slug, userId, [
                'admin',
                'owner',
            ]);

            const area = await this.areaRepo.findBySlug(project.id, key);

            if (!area) {
                throw new BaseException(
                    {
                        code: AreaErrorCodes.NOT_FOUND,
                        message: AreaErrorMessages[AreaErrorCodes.NOT_FOUND],
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            // 3. ⭐ БИЗНЕС-ПРОВЕРКИ
            // 3.1 Проверка на наличие связанных задач
            // Вариант А: Запретить удаление (безопасно)
            // Вариант Б: Спросить подтверждение (через query параметр)
            // Вариант В: Автоматически переместить задачи в дефолтную область

            await this.checkLastArea(project.id);

            const result = await this.areaRepo.delete(project.id, area.id);

            return {
                success: result,
                message: `Пространство ${area.title} успешно удалено.`,
            };
        } catch (e) {
            if (e instanceof BaseException) throw e;

            throw new BaseException(
                {
                    code: AreaErrorCodes.DELETE_FAILED,
                    message: AreaErrorMessages[AreaErrorCodes.DELETE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async checkLastArea(projectId: string): Promise<void> {
        const areasCount = await this.areaRepo.countByProject(projectId);

        if (areasCount <= 1) {
            throw new BaseException(
                {
                    code: AreaErrorCodes.CANNOT_DELETE_LAST_AREA,
                    message: AreaErrorMessages[AreaErrorCodes.CANNOT_DELETE_LAST_AREA],
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
