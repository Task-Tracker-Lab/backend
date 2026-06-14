import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { CreateShareTokenDto } from '../../dtos';
import { createHash, randomBytes } from 'crypto';
import { BaseException } from '@shared/error';
import { ProjectAccessPolicy } from '@core/projects/domain/policy';
import { IProjectRepository } from '@core/projects/domain/repository';
import { ProjectErrorCodes, ProjectErrorMessages } from '@core/projects/domain/errors';
import {
    SHARE_LINK_LENGTH,
    SHARE_LINK_PREFIX,
    SHARE_LINK_TTL_MONTHS,
} from '@core/projects/infrastructure/constants';

@Injectable()
export class GenerateShareTokenUseCase {
    constructor(
        @Inject('IProjectRepository')
        private readonly projectsRepo: IProjectRepository,
        private readonly policy: ProjectAccessPolicy,
    ) {}

    public async execute(slug: string, teamId: string, userId: string, dto: CreateShareTokenDto) {
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

        const expiresAt = this.resolveExpiration(dto?.ttl);

        const rawToken = this.generateToken();
        const hashedToken = this.hashToken(rawToken);

        const result = await this.projectsRepo.createShare({
            projectId: project.id,
            token: hashedToken,
            expiresAt: expiresAt.toISOString(),
            createdBy: userId,
        });

        if (!result) {
            throw new BaseException(
                {
                    code: ProjectErrorCodes.UPDATE_FAILED,
                    message: 'Не удалось создать ссылку доступа',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        const durationMsg = dto?.ttl
            ? `закроется ${expiresAt.toLocaleDateString('ru-RU')}`
            : 'бессрочна (на 3 месяца по умолчанию)';

        return {
            success: true,
            message: `Ссылка для проекта «${project.name}» создана и ${durationMsg}`,
            payload: {
                token: rawToken,
                expiresAt: expiresAt.toISOString(),
            },
        };
    }

    /**
     * Вычисляет дату истечения токена.
     * Если ttl передан — использует его, иначе +3 месяца от текущей даты.
     */
    private resolveExpiration(ttl?: string): Date {
        if (ttl) {
            const date = new Date(ttl);

            if (isNaN(date.getTime())) {
                throw new BaseException(
                    {
                        code: ProjectErrorCodes.INVALID_STATUS,
                        message: 'Невалидная дата истечения',
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            if (date <= new Date()) {
                throw new BaseException(
                    {
                        code: ProjectErrorCodes.INVALID_STATUS,
                        message: 'Дата истечения не может быть в прошлом',
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            return date;
        }

        const date = new Date();
        date.setMonth(date.getMonth() + SHARE_LINK_TTL_MONTHS);
        return date;
    }

    private generateToken(): string {
        return `${SHARE_LINK_PREFIX}${randomBytes(SHARE_LINK_LENGTH).toString('hex')}`;
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}
