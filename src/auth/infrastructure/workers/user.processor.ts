import { Processor, WorkerHost } from '@nestjs/bullmq';
import { AuthQueues } from '@core/auth/domain/enums';
import { Job } from 'bullmq';
import { CreateTeamUseCase } from '@core/teams/application/use-cases';
import { CreateProjectUseCase } from '@core/projects/application/use-cases';
import { AuthUserJobs } from '@core/auth/domain/enums/auth-jobs.enum';
import { CreateUserWorkspaceEvent } from '@core/auth/domain/events/create-user-workspace.event';

@Processor(AuthQueues.AUTH_USER)
export class UserProcessor extends WorkerHost {
    constructor(
        private readonly createTeamUseCase: CreateTeamUseCase,
        private readonly createProjectUseCase: CreateProjectUseCase,
    ) {
        super();
    }

    async process(job: Job<CreateUserWorkspaceEvent>): Promise<void> {
        await job.log(`[START] Job ID: ${job.id} | Type: ${job.name}`);

        try {
            switch (job.name) {
                case AuthUserJobs.CREATE_WORKSPACE:
                    await this.createWorkspace(job);
                    break;

                default:
                    await job.log(`[WRN] No handler for job: ${job.name}`);
                    await job.updateProgress(100);
            }

            await job.log(`[DONE] Job ${job.id} processed`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : '';

            await job.log(`[FAIL] ${errorMessage}`);
            if (errorStack) {
                await job.log(errorStack);
            }

            throw error;
        }
    }

    private createWorkspace = async (job: Job<CreateUserWorkspaceEvent>) => {
        const { userId, username } = job.data;

        await job.log(`Start creating a workspace for ${username}`);
        await job.updateProgress(20);

        const team = await this.createTeamUseCase.execute(userId, {
            name: username,
            description: `Personal team for ${username}`,
        });

        await this.createProjectUseCase.execute(userId, team.teamId, {
            name: `${username}'s Project`,
            description: `Personal project for ${username}`,
            key: username.slice(0, 10).toUpperCase(),
            visibility: 'private',
        });

        await job.log(`Successfully created a workspace for ${username}`);
        await job.updateProgress(100);
    };
}
