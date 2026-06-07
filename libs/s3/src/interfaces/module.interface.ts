import type { S3ClientConfig } from '@aws-sdk/client-s3';

export interface S3Connection extends Pick<S3ClientConfig, 'credentials' | 'endpoint' | 'region'> {
    endpoint: string;
    region: string;
}

export interface S3Config extends Omit<S3ClientConfig, keyof S3Connection> {}

export interface S3ModuleOptions {
    connection: S3Connection;
    bucket: string;
    config?: S3Config;
}
