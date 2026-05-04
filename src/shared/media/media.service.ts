import { HttpStatus, Injectable } from '@nestjs/common';
import { S3Service } from '@libs/s3';
import type { UploadMediaDto } from './dtos';
import { BaseException } from '@shared/error';
import { ImagorService } from '@libs/imagor';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import * as path from 'path';
import { MEDIA_STRATEGIES } from './strategies';
import { MEDIA_QUEUE } from './media.constant';

@Injectable()
export class MediaService {
    constructor(
        @InjectQueue(MEDIA_QUEUE)
        private readonly queue: Queue,
        private readonly s3: S3Service,
        private readonly imagor: ImagorService,
    ) {}

    public upload = async (dto: UploadMediaDto, userId: string) => {
        const { context, file } = dto;

        const folder = context.replace(/\./g, '/');
        const key = `${Date.now()}-${userId}${path.extname(file.filename)}`;

        try {
            const url = await this.s3.uploadFile(file.buffer, {
                mimetype: file.mimetype,
                original: file.filename,
                path: { folder, key },
            });

            await this.dispatch(dto, userId, url);

            return { success: true, url };
        } catch (error) {
            this.handleError(error);
        }
    };

    private async dispatch(dto: UploadMediaDto, userId: string, url: string) {
        const strategy = MEDIA_STRATEGIES[dto.context];

        if (!strategy) {
            return;
        }

        const payload = strategy.createPayload(dto, userId, url);

        await this.queue.add(strategy.jobName, payload, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
        });
    }

    private handleError(error: unknown): never {
        if (error instanceof BaseException) throw error;

        throw new BaseException(
            {
                code: 'MEDIA_SAVE_FAILED',
                message: 'Ошибка при сохранении медиа-данных',
                details: [{ reason: error instanceof Error ? error.message : 'Unknown error' }],
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}
