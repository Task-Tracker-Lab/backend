import { AreaQueues, AreaWorkspaceJobs } from '@core/area/domain/enums';
import { AreaCreateEvent } from '@core/area/domain/events';
import { CreateProjectUseCase } from '@core/project/application/use-cases';
import { ProjectQueues, ProjectWorkspaceJobs } from '@core/project/domain/enums';
import { ProjectCreateEvent } from '@core/project/domain/events';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';

@Injectable()
@Processor(ProjectQueues.PROJECT_WORKSPACE)
export class ProjectProcessor extends WorkerHost {
    constructor(
        private readonly createProjectUseCase: CreateProjectUseCase,
        @InjectQueue(AreaQueues.AREA_WORKSPACE)
        private readonly areaQueue: Queue,
    ) {
        super();
    }

    async process(job: Job<ProjectCreateEvent>): Promise<void> {
        await job.log(`[START] Job ID: ${job.id} | Type: ${job.name}`);

        try {
            switch (job.name) {
                case ProjectWorkspaceJobs.CREATE_PROJECT:
                    await this.handleTeamCreated(job);
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

    private readonly handleTeamCreated = async (job: Job<ProjectCreateEvent>) => {
        const { teamId, userId } = job.data;

        await job.log(`Start creating default project for team with ID "${teamId}"`);
        await job.updateProgress(20);

        const timestampSuffix = Date.now().toString(36);

        const project = await this.createProjectUseCase.execute(userId, teamId, {
            name: `Мой проект`,
            description: `Проект по умолчанию`,
            slug: `my-project-${timestampSuffix}`,
            status: 'active',
            visibility: 'private',
        });

        await job.log(`Project created: ${project.slug}`);
        await job.updateProgress(100);

        const event = new AreaCreateEvent(userId, project.slug);
        await this.areaQueue.add(AreaWorkspaceJobs.CREATE_AREA, event);

        await job.log(
            `Event ${AreaWorkspaceJobs.CREATE_AREA} sent to area queue for project with slug ${project.slug}`,
        );
    };
}
