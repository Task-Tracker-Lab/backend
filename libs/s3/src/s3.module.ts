import { S3Client } from '@aws-sdk/client-s3';
import { Inject, Module, OnApplicationShutdown } from '@nestjs/common';

import { S3_CLIENT } from './constants';
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './s3.module-definition';
import { S3Service } from './s3.service';

import type { S3ModuleOptions } from './interfaces';

@Module({
    providers: [
        {
            provide: S3_CLIENT,
            inject: [MODULE_OPTIONS_TOKEN],
            useFactory: (options: S3ModuleOptions) => {
                const { connection, config } = options;

                return new S3Client({
                    ...connection,
                    ...config,
                });
            },
        },
        S3Service,
    ],
    exports: [S3Service],
})
export class S3Module extends ConfigurableModuleClass implements OnApplicationShutdown {
    constructor(@Inject(S3_CLIENT) private readonly client: S3Client) {
        super();
    }

    onApplicationShutdown() {
        if (this.client.destroy) {
            this.client.destroy();
        }
    }
}
