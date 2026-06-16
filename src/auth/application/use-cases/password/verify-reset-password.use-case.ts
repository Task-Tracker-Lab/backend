import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import { verify as verifyOTP } from 'otplib';

import { AuthErrorCodes, AuthErrorMessages } from '../../../domain/errors';
import { VerifyResetCodeDto } from '../../dtos';

@Injectable()
export class VerifyResetPasswordUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
    ) {}

    async execute(dto: VerifyResetCodeDto) {
        const redisKey = `pass:reset:${dto.email}`;
        const cachedData = await this.cacheService.getOne(redisKey);

        if (!cachedData) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.RESET_SESSION_NOT_FOUND,
                    message: AuthErrorMessages[AuthErrorCodes.RESET_SESSION_NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const resetSession = JSON.parse(cachedData);

        if (!resetSession) {
            await this.cacheService.removeOne(redisKey);

            throw new BaseException(
                {
                    code: AuthErrorCodes.DATA_CORRUPTION,
                    message: AuthErrorMessages[AuthErrorCodes.DATA_CORRUPTION],
                    details: [{ target: 'cache', message: 'Поврежденные данные сброса пароля' }],
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        if (!resetSession.isVerified) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.CODE_NOT_VERIFIED,
                    message: AuthErrorMessages[AuthErrorCodes.CODE_NOT_VERIFIED],
                    details: [{ target: 'code', message: 'Код подтверждения не верифицирован' }],
                },
                HttpStatus.FORBIDDEN,
            );
        }

        try {
            const verifyResult = await verifyOTP({
                token: dto.code,
                secret: resetSession.otp.secret,
                digits: 6,
                period: 900,
                strategy: 'totp',
            });

            if (!verifyResult.valid) {
                throw new BaseException(
                    {
                        code: AuthErrorCodes.INVALID_CODE,
                        message: AuthErrorMessages[AuthErrorCodes.INVALID_CODE],
                        details: [{ target: 'code', message: 'The provided OTP is incorrect' }],
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }

            await this.cacheService.setOne(
                redisKey,
                JSON.stringify({ ...resetSession, isVerified: true }),
                600,
            );

            return {
                success: true,
                message: 'Код успешно подтвержден. Теперь вы можете установить новый пароль.',
            };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: AuthErrorCodes.RESET_PASSWORD_FAILED,
                    message: AuthErrorMessages[AuthErrorCodes.RESET_PASSWORD_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
