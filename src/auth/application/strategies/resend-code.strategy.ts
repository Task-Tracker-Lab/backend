import { Queue } from 'bullmq';
import { ResendCodeDto } from '../dtos';

export abstract class ResendCodeStrategy<TCacheData = unknown> {
    abstract readonly context: ResendCodeDto['context'];
    abstract readonly successMessage: string;
    abstract readonly cacheNotFoundCode: string;
    abstract readonly cacheNotFoundMessage: string;

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
