import { TeamQueues, TeamWorkspaceJobs } from '@core/team/domain/enums';
import { CreateTeamEvent } from '@core/team/domain/events/create-team.event';
import { Processor, InjectQueue, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';

import { AuthQueues, AuthUserJobs } from '../../domain/enums';
import { CreateUserWorkspaceEvent } from '../../domain/events';

@Injectable()
@Processor(AuthQueues.AUTH_USER)
export class UserProcessor extends WorkerHost {
    constructor(
        @InjectQueue(TeamQueues.TEAM_WORKSPACE)
        private readonly teamQueue: Queue,
    ) {
        super();
    }

    async process(job: Job<CreateUserWorkspaceEvent>): Promise<void> {
        await job.log(`[START] Job ID: ${job.id} | Type: ${job.name}`);

        try {
            switch (job.name) {
                case AuthUserJobs.CREATE_WORKSPACE:
                    await this.handleCreateWorkspace(job);
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

    private readonly handleCreateWorkspace = async (job: Job<CreateUserWorkspaceEvent>) => {
        const { userId } = job.data;

        await job.log(`Start workspace creation flow for user with ID${userId}`);
        await job.updateProgress(20);

        const event = new CreateTeamEvent(userId);
        await this.teamQueue.add(TeamWorkspaceJobs.CREATE_TEAM, event);

        await job.log(
            `Event ${TeamWorkspaceJobs.CREATE_TEAM} sent to team queue for user ${userId}`,
        );
        await job.updateProgress(100);
    };
}
