import { Inject, Injectable } from '@nestjs/common';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3_OPTIONS } from './s3.constants';
import { S3ModuleOptions } from './interfaces';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    public readonly bucket: string;
    private readonly endpoint: string;

    constructor(
        @Inject(S3_OPTIONS)
        private options: S3ModuleOptions,
    ) {
        const { bucket, credentials, endpoint, region } = options.connection;
        this.bucket = bucket;
        this.endpoint = endpoint as string;

        this.s3Client = new S3Client({
            region,
            endpoint,
            credentials,
            ...options.config,
        });
    }

    async deleteFile(fileUrl: string): Promise<void> {
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

    async uploadFile(
        file: Buffer,
        options: {
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
        const { mimetype, original, path, cacheControl } = options;

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
