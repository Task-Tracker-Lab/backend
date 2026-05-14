import { Inject, Injectable } from '@nestjs/common';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3_CLIENT } from './s3.constants';
import { S3ModuleOptions } from './interfaces';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { MODULE_OPTIONS_TOKEN } from './s3.module-definition';

@Injectable()
export class S3Service {
    constructor(
        @Inject(S3_CLIENT)
        private s3Client: S3Client,
        @Inject(MODULE_OPTIONS_TOKEN)
        private options: S3ModuleOptions,
    ) {}

    private get bucket(): string {
        return this.options.bucket;
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
