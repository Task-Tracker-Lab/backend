import { Module } from '@nestjs/common';
import type { S3ModuleOptions } from './interfaces';
import { S3Service } from './s3.service';
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './s3.module-definition';
import { S3_CLIENT } from './s3.constants';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
    providers: [
        S3Service,
        {
            provide: S3_CLIENT,
            inject: [MODULE_OPTIONS_TOKEN],
            useFactory: (options: S3ModuleOptions) => {
                return new S3Client(options.clientConfig);
            },
        },
    ],
    exports: [S3Service],
})
export class S3Module extends ConfigurableModuleClass {}
