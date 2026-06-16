import { AuthMailJobs } from '@core/auth/domain/enums';
import { RegisterCodeEvent } from '@core/auth/domain/events';
import { EMAIL_CODE_TTL_SECONDS, SIGNUP_CACHE_KEY } from '@core/auth/infrastructure/constants';
import { generate, generateSecret } from 'otplib';

import { AuthErrorCodes, AuthErrorMessages } from '../../domain/errors';

import { ResendCodeStrategy } from './resend-code.strategy';

import type { SignUpCacheData } from '@core/auth/application/interfaces';
import type { Queue } from 'bullmq';

export class SignUpResendStrategy extends ResendCodeStrategy<SignUpCacheData> {
    readonly context = 'sign-up' as const;
    readonly successMessage = 'Повторный код подтверждения отправлен на вашу почту';
    readonly cacheNotFoundCode = AuthErrorCodes.REGISTRATION_EXPIRED;
    readonly cacheNotFoundMessage = AuthErrorMessages[AuthErrorCodes.REGISTRATION_EXPIRED];

    getCacheKey(email: string): string {
        return SIGNUP_CACHE_KEY(email);
    }

    async generateOtp(): Promise<{ readonly token: string; readonly secret: string }> {
        const secret = generateSecret();
        const token = await generate({
            secret,
            algorithm: 'sha256',
            digits: 6,
            period: EMAIL_CODE_TTL_SECONDS,
            strategy: 'totp',
        });

        return { token, secret };
    }

    buildNewCacheData(
        cachedData: SignUpCacheData,
        newToken: string,
        newSecret: string,
    ): SignUpCacheData {
        return {
            ...cachedData,
            otp: { token: newToken, secret: newSecret },
        };
    }

    async dispatchEmail(
        mailQueue: Queue,
        email: string,
        token: string,
        cachedData: SignUpCacheData,
    ): Promise<void> {
        const event = new RegisterCodeEvent(email, cachedData.user.firstName, token);
        await mailQueue.add(AuthMailJobs.SEND_REGISTER_CODE, event, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });
    }
}
