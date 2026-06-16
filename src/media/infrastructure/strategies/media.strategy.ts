// eslint-disable-next-line no-restricted-syntax
import type { UploadMediaDto } from '../../application/dtos';

export abstract class MediaDispatchStrategy {
    abstract readonly jobName: string;
    abstract createPayload(dto: UploadMediaDto, userId: string, path: string): unknown;
}
