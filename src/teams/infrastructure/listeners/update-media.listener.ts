import { HttpStatus, Inject, Logger } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { ROLE_PRIORITY } from '@shared/constants';
import { ITeamsRepository } from '@core/teams/domain/repository';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { MEDIA_QUEUE, type UpdateMediaTeam } from '@shared/media';

@Processor(MEDIA_QUEUE)
export class UpdateTeamMediaListener extends WorkerHost {
    private readonly logger = new Logger(UpdateTeamMediaListener.name);

    constructor(
        @Inject('ITeamsRepository')
        private readonly repository: ITeamsRepository,
    ) {
        super();
    }

    async process(job: Job<UpdateMediaTeam>): Promise<void> {
        if (job.data.entity.type !== 'team') return;

        const { initiatorId, url, entity, type } = job.data;

        try {
            const teamId = await this.validatePermissionsAndGetTeamId(entity.slug, initiatorId);

            await this.executeMediaUpdate(teamId, type, url);

            this.logger.log(`Successfully updated ${type} for team ${entity.slug}`);
        } catch (error) {
            this.logger.error(
                `Failed to update ${type} for team ${entity.slug}: ${error instanceof Error ? error.message : String(error)}`,
            );
            throw error;
        }
    }

    private async validatePermissionsAndGetTeamId(slug: string, userId: string): Promise<string> {
        const team = await this.repository.findBySlug(slug);
        if (!team) {
            throw new BaseException(
                {
                    code: 'TEAM_NOT_FOUND',
                    message: 'Команда не найдена',
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const member = await this.repository.findMember(team.id, userId);

        const hasAccess = member && ROLE_PRIORITY[member.role] >= ROLE_PRIORITY.moderator;

        if (!hasAccess) {
            throw new BaseException(
                {
                    code: 'ACCESS_DENIED',
                    message: 'Недостаточно прав для обновления медиа',
                },
                HttpStatus.FORBIDDEN,
            );
        }

        return team.id;
    }

    private async executeMediaUpdate(
        teamId: string,
        type: 'banner' | 'avatar',
        url: string,
    ): Promise<void> {
        const updateActions: Record<string, (id: string, path: string) => Promise<unknown>> = {
            banner: (id, path) => this.repository.updateTeamBanner(id, path),
            avatar: (id, path) => this.repository.updateTeamAvatar(id, path),
        };

        const action = updateActions[type];

        if (!action) {
            throw new Error(`Unsupported media type: ${type}`);
        }

        await action(teamId, url);
    }
}
