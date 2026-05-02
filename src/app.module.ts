import { Module } from '@nestjs/common';
import { ConfigModule } from '@libs/config';
import { DatabaseModule } from '@libs/database';
import { ConfigService } from '@nestjs/config';
import * as schema from './shared/entities';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { HealthModule } from '@libs/health';
import { UserModule } from './user';
import { GlobalExceptionFilter } from '@shared/error';
import { AuthModule } from './auth/auth.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { FastifyAdapter } from '@bull-board/fastify';
import { BullModule } from '@nestjs/bullmq';
import { MailModule } from '@shared/adapters/mail';
import { TeamsModule } from './teams';
import { ProjectsModule } from './projects';
import { HttpModule } from '@nestjs/axios';
import { MediaModule } from '@shared/media';
import { CacheModule } from '@shared/adapters/cache/module';
import { S3Service } from '@libs/s3';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { DatabaseHealthService } from '@libs/database';
import { ZodValidationInterceptor } from '@shared/interceptors/zod-validation.interceptor';
import { BoardsModule } from '@core/boards';

@Module({
    imports: [
        ConfigModule,
        PrometheusModule.registerAsync({
            useFactory: () => ({
                path: 'dump',
                defaultMetrics: {
                    enabled: process.env.NODE_ENV !== 'test',
                },
            }),
        }),
        DatabaseModule.registerAsync({
            global: true,
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => {
                return {
                    schema,
                    schemaName: cfg.getOrThrow('DB_SCHEMA'),
                    logging: true,
                };
            },
        }),
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                connection: {
                    password: cfg.get('REDIS_PASSWORD'),
                    host: cfg.getOrThrow('REDIS_HOST'),
                    port: cfg.get('REDIS_PORT'),
                },
            }),
        }),
        CacheModule,
        MediaModule,
        HttpModule.register({ global: true }),
        MailModule,
        AuthModule,
        UserModule,
        TeamsModule,
        ProjectsModule,
        BoardsModule,
        BullBoardModule.forRoot({
            route: '/queues',
            boardOptions: {
                uiConfig: {
                    sortQueues: true,
                    pollingInterval: { forceInterval: 10, showSetting: false },
                    hideRedisDetails: true,
                },
            },
            adapter: FastifyAdapter,
        }),
        HealthModule.registerAsync({
            inject: [DatabaseHealthService, S3Service, CACHE_SERVICE],
            useFactory: (db: DatabaseHealthService, s3: S3Service, cache: ICacheService) => {
                const version = process.env.npm_package_version;

                return {
                    serviceName: 'gateway',
                    version,
                    indicators: {
                        database: async () => db.isAlive(),
                        cache: async () => cache.isAlive(),
                        storage: async () => s3.isAlive(),
                    },
                };
            },
        }),
    ],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        },
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ZodValidationInterceptor,
        },
    ],
})
export class AppModule {}
