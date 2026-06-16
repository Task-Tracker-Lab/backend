import { ImagorModule } from '@libs/imagor';
import { S3Module } from '@libs/s3';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MediaController } from './application/controllers';
import { MediaService } from './application/media.service';
import { MEDIA_FLOW, MEDIA_QUEUES } from './domain/enums';
import { MediaProcessor } from './infrastructure/workers';

@Module({
    imports: [
        S3Module.registerAsync({
            inject: [ConfigService],
            global: true,
            useFactory: (cfg: ConfigService) => ({
                bucket: cfg.getOrThrow('S3_BUCKET_NAME'),
                connection: {
                    endpoint: cfg.getOrThrow('S3_ENDPOINT'),
                    region: cfg.getOrThrow('S3_REGION'),
                    credentials: {
                        accessKeyId: cfg.getOrThrow('S3_ACCESS_KEY'),
                        secretAccessKey: cfg.getOrThrow('S3_SECRET_KEY'),
                    },
                },
                config: {
                    forcePathStyle: true,
                    connectTimeout: 2000,
                    requestTimeout: 5000,
                    maxAttempts: 3,
                },
            }),
        }),
        ImagorModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                url: cfg.getOrThrow('IMAGOR_URL'),
                secret: cfg.getOrThrow('IMAGOR_SECRET'),
                debug: true,
                filters: { format: 'webp', smart: true, strip_icc: true },
            }),
        }),
        BullModule.registerQueue({ name: MEDIA_QUEUES.RESIZE }, { name: MEDIA_QUEUES.SAVE_ENTITY }),
        BullModule.registerFlowProducer({
            name: MEDIA_FLOW,
        }),
    ],
    controllers: [MediaController],
    providers: [MediaProcessor, MediaService],
})
export class MediaModule {}
