import { IUserRepository } from '@core/user/domain/repository';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { MEDIA_JOBS, MEDIA_QUEUES, type UpdateMediaUser } from '@shared/media';
import { UnrecoverableError, type Job } from 'bullmq';

@Processor(MEDIA_QUEUES.SAVE_ENTITY)
export class UpdateAvatarListener extends WorkerHost {
    constructor(
        @Inject('IUserRepository')
        private readonly repository: IUserRepository,
    ) {
        super();
    }

    async process(job: Job<UpdateMediaUser>) {
        if (job.name !== MEDIA_JOBS.UPDATE_USER_AVATAR) return;

        const { entity, path } = job.data;

        try {
            await job.updateProgress(10);
            await job.log(path);
            if (!path) {
                throw new UnrecoverableError(
                    `Media processing failed: no storage path returned for entity ${entity.id}`,
                );
            }

            await job.updateProgress(40);

            const userAccount = await this.repository.findById(entity.id);

            if (!userAccount) {
                await job.log(`User ${entity.id} missing in database.`);
                return { status: 'aborted', reason: 'USER_NOT_FOUND' };
            }

            await job.updateProgress(70);

            await this.repository.updateAvatar(userAccount.user.id, path);

            await job.updateProgress(100);

            await job.log(`Successfully updated avatar for user ${userAccount.user.id}`);
            return;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await job.log(`Critical failure: ${errorMessage}`);

            throw error;
        }
    }
}
