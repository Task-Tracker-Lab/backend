import { ProjectQueues, ProjectWorkspaceJobs } from '@core/project/domain/enums';
import { ProjectCreateEvent } from '@core/project/domain/events/create-project.event';
import { CreateTeamUseCase } from '@core/team/application/use-cases';
import { TeamQueues, TeamWorkspaceJobs } from '@core/team/domain/enums';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';

import { CreateTeamEvent } from '../../domain/events/create-team.event';

@Injectable()
@Processor(TeamQueues.TEAM_WORKSPACE)
export class TeamProcessor extends WorkerHost {
    constructor(
        private readonly createTeamUseCase: CreateTeamUseCase,
        @InjectQueue(ProjectQueues.PROJECT_WORKSPACE)
        private readonly projectQueue: Queue,
    ) {
        super();
    }

    async process(job: Job<CreateTeamEvent>): Promise<void> {
        await job.log(`[START] Job ID: ${job.id} | Type: ${job.name}`);

        try {
            switch (job.name) {
                case TeamWorkspaceJobs.CREATE_TEAM:
                    await this.handleCreateTeam(job);
                    break;

                default:
                    await job.log(`[WRN] No handler for job: ${job.name}`);
                    await job.updateProgress(100);
            }

            await job.log(`[DONE] Job ${job.id} processed`);
        } catch (error) {
            await job.log(String(error));
            throw error;
        }
    }

    private readonly handleCreateTeam = async (job: Job<CreateTeamEvent>) => {
        const { userId } = job.data;

        await job.log(`Start creating default team for user with ID${userId}`);
        await job.updateProgress(20);

        const team = await this.createTeamUseCase.execute(userId, {
            name: `Моя команда`,
            description: `Команда по умолчанию`,
        });

        await job.log(
            `Default team with ID "${team.teamId}" successfully created for user with ID "${userId}"`,
        );
        await job.updateProgress(100);

        const event = new ProjectCreateEvent(userId, team.teamId);
        await this.projectQueue.add(ProjectWorkspaceJobs.CREATE_PROJECT, event);

        await job.log(`Event team.created sent to project queue for team ${team.teamId}`);
    };
}
