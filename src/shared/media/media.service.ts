import { HttpStatus, Injectable } from '@nestjs/common';
import { S3Service } from '@libs/s3';
import type { UploadMediaDto } from './dtos';
import { BaseException } from '@shared/error';
import { FlowProducer } from 'bullmq';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { MEDIA_STRATEGIES } from './strategies';
import { MEDIA_FLOW, MEDIA_JOBS, MEDIA_QUEUES } from './media.constant';
import { MediaDispatchStrategy } from './strategies/media.strategy';
import { extname } from 'path';

@Injectable()
export class MediaService {
    constructor(
        @InjectFlowProducer(MEDIA_FLOW)
        private readonly flow: FlowProducer,
        private readonly s3: S3Service,
    ) {}

    public upload = async (dto: UploadMediaDto, userId: string) => {
        const { context, file } = dto;

        const strategy = this.getStrategy(context);
        const { folder, fileName } = this.generateStoragePath(context, userId, file.filename);

        try {
            const originalUrl = await this.s3.uploadFile(file.buffer, {
                mimetype: file.mimetype,
                original: file.filename,
                path: { folder, key: fileName },
            });

            await this.enqueueMediaFlow(strategy, dto, userId, originalUrl);

            return {
                success: true,
                message: 'Изменения вступят в силу после завершения фоновой обработки',
            };
        } catch (error) {
            this.handleError(error);
        }
    };

    private generateStoragePath(context: string, userId: string, originalName: string) {
        const contextPath = context.replace(/\./g, '/');
        const extension = extname(originalName);

        return {
            folder: `${contextPath}/${Date.now()}-${userId}`,
            fileName: `original${extension}`,
        };
    }

    private async enqueueMediaFlow(
        strategy: MediaDispatchStrategy,
        dto: UploadMediaDto,
        userId: string,
        url: string,
    ) {
        const payload = strategy.createPayload(dto, userId, url);

        return this.flow.add({
            name: MEDIA_JOBS.RESIZE_IMAGES,
            queueName: MEDIA_QUEUES.RESIZE,
            data: { userId, original: url, context: dto.context },
            opts: this.getJobOptions(5, 'fixed'),
            children: [
                {
                    name: strategy.jobName,
                    queueName: MEDIA_QUEUES.SAVE_ENTITY,
                    data: payload,
                    opts: { ...this.getJobOptions(3, 'exponential'), failParentOnFailure: true },
                },
            ],
        });
    }

    private getJobOptions(attempts: number, backoffType: 'fixed' | 'exponential') {
        return {
            attempts,
            backoff: { type: backoffType, delay: backoffType === 'fixed' ? 2000 : 1000 },
            // removeOnComplete: true,
            removeOnFail: false,
        };
    }

    private getStrategy(context: string) {
        const strategy = MEDIA_STRATEGIES[context];
        if (!strategy) {
            throw new BaseException(
                { code: 'STRATEGY_NOT_FOUND', message: `No strategy for ${context}` },
                HttpStatus.BAD_REQUEST,
            );
        }
        return strategy;
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
