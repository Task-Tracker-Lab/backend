// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ResendCodeDto } from '../dtos';

import type { Queue } from 'bullmq';

export abstract class ResendCodeStrategy<TCacheData = unknown> {
    abstract context: ResendCodeDto['context'];
    abstract successMessage: string;
    abstract cacheNotFoundCode: string;
    abstract cacheNotFoundMessage: string;

    abstract getCacheKey(email: string): string;

    abstract generateOtp(): Promise<{ token: string; secret: string }>;

    abstract buildNewCacheData(
        cachedData: TCacheData,
        newToken: string,
        newSecret: string,
    ): TCacheData;

    abstract dispatchEmail(
        mailQueue: Queue,
        email: string,
        token: string,
        cachedData: TCacheData,
    ): Promise<void>;
}
