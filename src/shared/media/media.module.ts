import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { S3Module } from '@libs/s3';
import { ConfigService } from '@nestjs/config';
import { MediaController } from './controller';
import { MEDIA_QUEUE } from './media.constant';
import { BullModule } from '@nestjs/bullmq';
import { ImagorModule } from '@libs/imagor';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
    imports: [
        S3Module.registerAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                connection: {
                    bucket: cfg.getOrThrow('S3_BUCKET_NAME'),
                    endpoint: cfg.getOrThrow('S3_ENDPOINT'),
                    region: cfg.getOrThrow('S3_REGION'),
                    credentials: {
                        accessKeyId: cfg.getOrThrow('S3_ACCESS_KEY'),
                        secretAccessKey: cfg.getOrThrow('S3_SECRET_KEY'),
                    },
                },
                // FOR MINIO COMPARTABLE
                config: { forcePathStyle: true },
            }),
        }),
        ImagorModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                url: cfg.getOrThrow('IMAGOR_URL'),
                secret: cfg.getOrThrow('IMAGOR_SECRET'),
                debug: true,
                filters: { format: 'webp', smart: true },
                presets: {
                    small: { width: 64, height: 64, blur: 20, quality: 80 },
                    medium: {
                        width: 256,
                        height: 256,
                        quality: 85,
                        sharpen: { amount: 0.5, radius: 1.0, threshold: 1 },
                    },
                    large: {
                        width: 512,
                        height: 512,
                        quality: 90,
                        sharpen: { amount: 0.5, radius: 1.0, threshold: 1 },
                    },
                },
            }),
        }),
        BullBoardModule.forFeature({ adapter: BullMQAdapter, name: MEDIA_QUEUE }),
        BullModule.registerQueue({ name: MEDIA_QUEUE }),
    ],
    controllers: [MediaController],
    providers: [MediaService],
})
export class MediaModule {}
