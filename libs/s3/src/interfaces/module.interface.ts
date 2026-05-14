import type { S3ClientConfig } from '@aws-sdk/client-s3';

export interface S3ModuleOptions {
    bucket: string;
    clientConfig: S3ClientConfig;
}
