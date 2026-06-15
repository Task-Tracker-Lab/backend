import { ImagorService } from '@libs/imagor';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MEDIA_JOBS, MEDIA_QUEUES, MEDIA_SPECS } from '../media.constant';
import { Job } from 'bullmq';
import { S3Service } from '@libs/s3';
import { dirname } from 'path';

@Processor(MEDIA_QUEUES.RESIZE)
export class MediaProcessor extends WorkerHost {
    constructor(
        private readonly imagor: ImagorService,
        private readonly s3: S3Service,
    ) {
        super();
    }

    async process(
        job: Job<{ readonly original: string; readonly context: string; readonly userId: string }>,
    ) {
        if (job.name !== MEDIA_JOBS.RESIZE_IMAGES) return;

        const { original: originalFilePath, context } = job.data;

        try {
            await job.updateProgress(5);

            const type = context.includes('banner') ? 'banner' : 'avatar';
            const resizeSpecs = MEDIA_SPECS[type];
            const targetFolder = dirname(originalFilePath);

            const progressStep = Math.floor(90 / resizeSpecs.length);

            for (let i = 0; i < resizeSpecs.length; i++) {
                const spec = resizeSpecs[i];
                if (!spec) continue;

                const { name, ...dimensions } = spec;
                const targetFileName = `${name}.webp`;

                const processedImage = await this.imagor.get(`/${originalFilePath}`, dimensions);

                const uploadedPath = await this.s3.upload(processedImage, {
                    original: targetFileName,
                    mimetype: 'image/webp',
                    path: {
                        folder: targetFolder,
                        key: targetFileName,
                    },
                });

                await job.log(`[Variant:${name}] Saved to: ${uploadedPath}`);
                await job.updateProgress(5 + progressStep * (i + 1));
            }

            await job.updateProgress(100);

            return {
                original: originalFilePath,
                folder: targetFolder,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            await job.log(`Error during resizing: ${errorMessage}`);

            throw error;
        }
    }
}
