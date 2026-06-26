import { CreateAreaUseCase } from '@core/area/application/use-cases';
import { AreaQueues, AreaWorkspaceJobs } from '@core/area/domain/enums';
import { AreaCreateEvent } from '@core/area/domain/events';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

@Injectable()
@Processor(AreaQueues.AREA_WORKSPACE)
export class AreaProcessor extends WorkerHost {
    constructor(private readonly createAreaUseCase: CreateAreaUseCase) {
        super();
    }

    async process(job: Job<AreaCreateEvent>): Promise<void> {
        await job.log(`[START] Job ID: ${job.id} | Type: ${job.name}`);

        try {
            switch (job.name) {
                case AreaWorkspaceJobs.CREATE_AREA:
                    await this.handleProjectCreated(job);
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

    private readonly handleProjectCreated = async (job: Job<AreaCreateEvent>) => {
        const { userId, projectSlug } = job.data;

        await job.log(`Start creating default area for project with slug "${projectSlug}"`);
        await job.updateProgress(20);

        const timestampSuffix = Date.now().toString(36);

        await this.createAreaUseCase.execute(
            projectSlug,
            {
                title: `Моя доска`,
                description: `Доска по умолчанию`,
                slug: `my-area-${timestampSuffix}`,
                isLocked: false,
            },
            userId,
        );

        await job.log(`Area created successfully for project ${projectSlug}`);
        await job.updateProgress(100);
    };
}
