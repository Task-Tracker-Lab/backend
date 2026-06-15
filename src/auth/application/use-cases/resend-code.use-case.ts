import { ResendCodeDto } from '@core/auth/application/dtos';
import { AuthQueues } from '@core/auth/domain/enums';
import {
    EMAIL_CODE_TTL_SECONDS,
    MAX_ATTEMPTS,
    RESEND_ATTEMPTS_KEY,
    RESEND_COOLDOWN_KEY,
    SECONDS_BETWEEN_ATTEMPTS,
} from '@core/auth/infrastructure/constants';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import { Queue } from 'bullmq';

import { RESEND_CODE_STRATEGIES, ResendCodeStrategy } from '../strategies';

@Injectable()
export class ResendCodeUseCase {
    private readonly logger = new Logger('TEST');
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @InjectQueue(AuthQueues.AUTH_MAIL)
        private readonly mailQueue: Queue,
    ) {}

    async execute(dto: ResendCodeDto) {
        const strategy = this.getStrategy(dto.context);
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

        const cooldownKey = RESEND_COOLDOWN_KEY(dto.context, dto.email);
        const { ttlSeconds: cooldownTtl } = await this.cacheService.getOneWithTtl(cooldownKey);

        if (cooldownTtl > 0) {
            throw new BaseException(
                {
                    code: 'RESEND_RATE_LIMIT',
                    message: `Повторная отправка доступна через ${this.formatWaitTime(cooldownTtl)}`,
                    details: [
                        {
                            target: 'email',
                            value: dto.email,
                            ttlSeconds: cooldownTtl,
                            nextResendAt: this.buildResendTiming(cooldownTtl).nextResendAt,
                        },
                    ],
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        const attemptsKey = RESEND_ATTEMPTS_KEY(dto.context, dto.email);
        const attemptsStr = await this.cacheService.getOne(attemptsKey);

        let attemptsLeft = attemptsStr ? parseInt(attemptsStr, 10) : MAX_ATTEMPTS;
        this.logger.error(attemptsLeft);
        if (attemptsLeft <= 0) {
            throw new BaseException(
                {
                    code: 'MAX_ATTEMPTS_REACHED',
                    message:
                        'Превышено максимальное количество попыток отправки кода. Начните процесс заново позже.',
                    details: [{ target: 'email', value: dto.email }],
                },
                HttpStatus.FORBIDDEN,
            );
        }

        attemptsLeft -= 1;

        const cachedData = JSON.parse(cachedDataStr);
        const { token, secret } = await strategy.generateOtp();
        const newCacheData = strategy.buildNewCacheData(cachedData, token, secret);

        await this.cacheService.setOne(
            cacheKey,
            JSON.stringify(newCacheData),
            EMAIL_CODE_TTL_SECONDS,
        );

        await this.cacheService.setOne(
            attemptsKey,
            attemptsLeft.toString(),
            EMAIL_CODE_TTL_SECONDS,
        );

        await this.cacheService.setOne(cooldownKey, 'locked', SECONDS_BETWEEN_ATTEMPTS);

        await strategy.dispatchEmail(this.mailQueue, dto.email, token, cachedData);

        return {
            success: true,
            message: strategy.successMessage,
            retries: attemptsLeft,
            ...this.buildResendTiming(SECONDS_BETWEEN_ATTEMPTS),
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
