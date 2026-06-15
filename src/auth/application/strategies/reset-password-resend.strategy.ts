import { AuthMailJobs } from '@core/auth/domain/enums';
import { ResetPasswordEvent } from '@core/auth/domain/events';
import type { ResetPasswordCacheData } from '@core/auth/application/interfaces';
import {
    EMAIL_CODE_TTL_SECONDS,
    RESET_PASSWORD_CACHE_KEY,
} from '@core/auth/infrastructure/constants';
import type { Queue } from 'bullmq';
import { generate, generateSecret } from 'otplib';
import { ResendCodeStrategy } from './resend-code.strategy';

export class ResetPasswordResendStrategy extends ResendCodeStrategy<ResetPasswordCacheData> {
    readonly context = 'reset-password' as const;
    readonly successMessage = 'Повторный код для восстановления пароля отправлен на вашу почту';
    readonly cacheNotFoundCode = 'RESET_SESSION_EXPIRED';
    readonly cacheNotFoundMessage =
        'Время подтверждения истекло или запрос не найден. Запросите код снова.';

    getCacheKey(email: string): string {
        return RESET_PASSWORD_CACHE_KEY(email);
    }

    async generateOtp(): Promise<{ readonly token: string; readonly secret: string }> {
        const secret = generateSecret();
        const token = await generate({
            secret,
            digits: 6,
            period: EMAIL_CODE_TTL_SECONDS,
            strategy: 'totp',
        });

        return { token, secret };
    }

    buildNewCacheData(
        cachedData: ResetPasswordCacheData,
        newToken: string,
        newSecret: string,
    ): ResetPasswordCacheData {
        return {
            ...cachedData,
            otp: { token: newToken, secret: newSecret },
            isVerified: false,
        };
    }

    async dispatchEmail(
        mailQueue: Queue,
        email: string,
        token: string,
        _cachedData: ResetPasswordCacheData,
    ): Promise<void> {
        const event = new ResetPasswordEvent(email, token);
        await mailQueue.add(AuthMailJobs.SEND_RESET_PASSWORD, event, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });
    }
}
