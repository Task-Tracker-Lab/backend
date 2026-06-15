import type { S3ClientConfig } from '@aws-sdk/client-s3';

export interface S3Connection extends Pick<S3ClientConfig, 'credentials' | 'endpoint' | 'region'> {
    readonly endpoint: string;
    readonly region: string;
}

export type S3Config = Omit<S3ClientConfig, keyof S3Connection>;

export interface S3ModuleOptions {
    readonly connection: S3Connection;
    readonly bucket: string;
    readonly config?: S3Config;
}
