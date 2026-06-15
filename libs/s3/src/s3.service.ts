import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import {
    DeleteObjectCommand,
    HeadBucketCommand,
    S3Client,
    PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';

import { S3_CLIENT } from './constants';
import { S3ModuleOptions } from './interfaces';
import { MODULE_OPTIONS_TOKEN } from './s3.module-definition';

@Injectable()
export class S3Service {
    constructor(
        @Inject(S3_CLIENT)
        private readonly s3Client: S3Client,
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: S3ModuleOptions,
    ) {}

    private get bucket(): string {
        return this.options.bucket;
    }

    async isAlive(): Promise<boolean> {
        try {
            await this.s3Client.send(
                new HeadBucketCommand({
                    Bucket: this.bucket,
                }),
            );
            return true;
        } catch {
            return false;
        }
    }

    async delete(fileUrl: string): Promise<void> {
        try {
            const url = new URL(fileUrl);
            const pathParts = url.pathname.split('/');
            const key = pathParts.slice(2).join('/');

            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );
        } catch (error) {
            console.error('S3 Rollback failed:', error);
        }
    }

    async upload(
        file: Buffer,
        fileOptions: {
            original: string;
            mimetype: string;
            cacheControl?: string;
            path?:
                | {
                      folder: string;
                      key?: string;
                  }
                | string;
        },
    ): Promise<string> {
        const { mimetype, original, path, cacheControl } = fileOptions;

        const folder = typeof path === 'object' ? path.folder : '';
        const key =
            (typeof path === 'object' ? path.key : path) || `${randomUUID()}${extname(original)}`;

        const fileName = [folder, key].filter(Boolean).join('/').replace(/\/+/g, '/');

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: fileName,
            Body: file,
            CacheControl: cacheControl || 'public, max-age=31536000, immutable',
            ContentType: mimetype,
        });

        await this.s3Client.send(command);

        return fileName;
    }
}
