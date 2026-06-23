import { MediaModule } from '@core/media';
import { ConfigModule } from '@libs/config';
import { DatabaseModule, DatabaseHealthService } from '@libs/database';
import { HealthModule } from '@libs/health';
import { MetricsModule } from '@libs/metrics';
import { S3Service } from '@libs/s3';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { CacheModule } from '@shared/adapters/cache/module';
import { ICacheService } from '@shared/adapters/cache/ports';
import { MailModule } from '@shared/adapters/mail';
import { GlobalExceptionFilter } from '@shared/error';
import { ZodValidationInterceptor } from '@shared/interceptors';
import { ZodValidationPipe } from 'nestjs-zod';

import { AreaModule } from './area';
import { AuthModule } from './auth/auth.module';
import { IssueModule } from './issue';
import { ProjectModule } from './project';
import * as schema from './shared/entities';
import { TeamsModule } from './teams';
import { UserModule } from './user';

@Module({
    imports: [
        ConfigModule,
        DatabaseModule.registerAsync({
            global: true,
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                schema,
                schemaName: cfg.getOrThrow('DB_SCHEMA'),
                logging: true,
            }),
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
        ProjectModule,
        AreaModule,
        IssueModule,
        MetricsModule,
        HealthModule.registerAsync({
            inject: [DatabaseHealthService, S3Service, CACHE_SERVICE],
            useFactory: (db: DatabaseHealthService, s3: S3Service, cache: ICacheService) => {
                const version = process.env['npm_package_version'] ?? '';

                return {
                    serviceName: 'gateway',
                    version,
                    indicators: {
                        database: () => db.isAlive(),
                        cache: () => cache.isAlive(),
                        storage: () => s3.isAlive(),
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
