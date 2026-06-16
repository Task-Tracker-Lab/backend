import { MEDIA_JOBS, MEDIA_QUEUES, UpdateMediaTeam } from '@core/media';
import { TeamMemberPolicy } from '@core/teams/domain/policy';
import { ITeamsRepository } from '@core/teams/domain/repository';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { type Job, UnrecoverableError } from 'bullmq';

import type { TeamRole } from '@shared/entities';

@Processor(MEDIA_QUEUES.SAVE_ENTITY)
export class UpdateTeamMediaListener extends WorkerHost {
    constructor(
        @Inject('ITeamsRepository')
        private readonly repository: ITeamsRepository,
        private readonly policy: TeamMemberPolicy,
    ) {
        super();
    }

    async process(job: Job<UpdateMediaTeam>): Promise<void> {
        if (job.name !== MEDIA_JOBS.UPDATE_TEAM_MEDIA) {
            return;
        }

        const { initiatorId, entity, type, path } = job.data;

        try {
            const teamId = await this.validatePermissionsAndGetTeamId(entity.id, initiatorId);

            await this.executeMediaUpdate(teamId, type, path);

            await job.log(`Successfully updated ${type} for team ${entity.id}`);
        } catch (error) {
            await job.log(
                `Failed to update ${type} for team ${entity.id}: ${error instanceof Error ? error.message : String(error)}`,
            );
            throw error;
        }
    }

    private async validatePermissionsAndGetTeamId(teamId: string, userId: string): Promise<string> {
        const team = await this.repository.findById(teamId);
        if (!team) {
            throw new UnrecoverableError('Команда не найдена');
        }

        const member = await this.repository.findMember(team.id, userId);

        if (!member) {
            throw new UnrecoverableError('Не состоит в этой команде');
        }

        const hasAccess = this.policy.canUpdateMedia(member.role as TeamRole);

        if (!hasAccess) {
            throw new UnrecoverableError('Недостаточно прав для обновления медиа');
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
            throw new UnrecoverableError(`Unsupported media type: ${type}`);
        }

        await action(teamId, url);
    }
}
