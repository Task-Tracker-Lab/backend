import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import { InjectQueue } from '@nestjs/bullmq';
import { AuthQueues } from '@core/auth/domain/enums';
import { Queue } from 'bullmq';
import { ResendCodeDto } from '@core/auth/application/dtos';
import {
    RESEND_CODE_COOLDOWN_SECONDS,
    RESEND_CODE_RATE_LIMIT_KEY,
} from '@core/auth/infrastructure/constants';
import { RESEND_CODE_STRATEGIES, ResendCodeStrategy } from '../strategies';

@Injectable()
export class ResendCodeUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @InjectQueue(AuthQueues.AUTH_MAIL)
        private readonly mailQueue: Queue,
    ) {}

    async execute(dto: ResendCodeDto) {
        const strategy = this.getStrategy(dto.context);
        const rateLimitKey = RESEND_CODE_RATE_LIMIT_KEY(dto.context, dto.email);

        const retryAfterSeconds = await this.cacheService.getTtl(rateLimitKey);

        if (retryAfterSeconds > 0) {
            throw this.createRateLimitException(dto.email, retryAfterSeconds);
        }

        const cacheKey = strategy.getCacheKey(dto.email);
        const cachedDataStr = await this.cacheService.getOne(cacheKey);

        if (!cachedDataStr) {
            throw new BaseException(
                {
                    code: strategy.cacheNotFoundCode,
                    message: strategy.cacheNotFoundMessage,
                    details: [{ target: 'email', value: dto.email }],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const cachedData = JSON.parse(cachedDataStr);
        const { token, secret } = await strategy.generateOtp();
        const newCacheData = strategy.buildNewCacheData(cachedData, token, secret);

        await this.cacheService.setOne(cacheKey, JSON.stringify(newCacheData), 900);
        await this.cacheService.setOne(rateLimitKey, '1', RESEND_CODE_COOLDOWN_SECONDS);
        await strategy.dispatchEmail(this.mailQueue, dto.email, token, cachedData);

        return {
            success: true,
            message: strategy.successMessage,
            ...this.buildResendTiming(RESEND_CODE_COOLDOWN_SECONDS),
        };
    }

    private getStrategy(context: ResendCodeDto['context']): ResendCodeStrategy {
        const strategy = RESEND_CODE_STRATEGIES[context];

        if (!strategy) {
            throw new BaseException(
                { code: 'STRATEGY_NOT_FOUND', message: `No strategy for ${context}` },
                HttpStatus.BAD_REQUEST,
            );
        }

        return strategy;
    }

    private createRateLimitException(email: string, retryAfterSeconds: number) {
        const { nextResendAt } = this.buildResendTiming(retryAfterSeconds);

        return new BaseException(
            {
                code: 'RESEND_RATE_LIMIT',
                message: `Повторная отправка доступна через ${this.formatWaitTime(retryAfterSeconds)}`,
                details: [
                    {
                        target: 'email',
                        value: email,
                        retryAfterSeconds,
                        nextResendAt,
                    },
                ],
            },
            HttpStatus.TOO_MANY_REQUESTS,
        );
    }

    private buildResendTiming(retryAfterSeconds: number) {
        return {
            retryAfterSeconds,
            nextResendAt: new Date(Date.now() + retryAfterSeconds * 1000).toISOString(),
        };
    }

    private formatWaitTime(totalSeconds: number) {
        const minutesLeft = Math.floor(totalSeconds / 60);
        const secondsLeft = totalSeconds % 60;

        if (minutesLeft > 0) {
            return `${minutesLeft} мин ${secondsLeft} сек`;
        }

        return `${secondsLeft} сек`;
    }
}
