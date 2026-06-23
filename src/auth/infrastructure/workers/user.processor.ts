import { AuthQueues } from '@core/auth/domain/enums';
import { AuthUserJobs } from '@core/auth/domain/enums/auth-jobs.enum';
import { CreateUserWorkspaceEvent } from '@core/auth/domain/events';
import { CreateProjectUseCase } from '@core/project/application/use-cases';
import { CreateTeamUseCase } from '@core/team/application/use-cases';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import slugify from 'slugify';

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
            await job.log(String(error));

            throw error;
        }
    }

    private readonly createWorkspace = async (job: Job<CreateUserWorkspaceEvent>) => {
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
            slug: slugify(username.slice(0, 10), {
                lower: true,
                strict: true,
            }),
            status: 'active',
            visibility: 'private',
        });

        await job.log(`Successfully created a workspace for ${username}`);
        await job.updateProgress(100);
    };
}
