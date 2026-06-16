import { SignUpCacheData } from '@core/auth/application/interfaces';
import { EMAIL_CODE_TTL_SECONDS, SIGNUP_CACHE_KEY } from '@core/auth/infrastructure/constants';
import { FindUserQuery } from '@core/user';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import * as argon from 'argon2';
import { Queue } from 'bullmq';
import { generate, generateSecret } from 'otplib';

import { AuthQueues, AuthMailJobs } from '../../../domain/enums';
import { AuthErrorCodes, AuthErrorMessages } from '../../../domain/errors';
import { RegisterCodeEvent } from '../../../domain/events';
import { SignUpDto } from '../../dtos';

@Injectable()
export class SignUpUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @InjectQueue(AuthQueues.AUTH_MAIL)
        private readonly mailQueue: Queue,
        private readonly findUserQ: FindUserQuery,
    ) {}

    async execute(dto: SignUpDto) {
        const cachedData = await this.cacheService.getOne(SIGNUP_CACHE_KEY(dto.email));

        if (cachedData) {
            throw new BaseException(
                {
                    code: AuthErrorCodes.CODE_ALREADY_SENT,
                    message: AuthErrorMessages[AuthErrorCodes.CODE_ALREADY_SENT],
                    details: [{ target: 'email', message: 'Verification code already sent' }],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            await this.findUserQ.execute({ email: dto.email }, { throwIfExists: true });

            const hashPass = await argon.hash(dto.password);

            const secret = generateSecret();
            const token = await generate({
                secret,
                algorithm: 'sha256',
                digits: 6,
                period: EMAIL_CODE_TTL_SECONDS,
                strategy: 'totp',
            });

            const data: SignUpCacheData = {
                user: dto,
                password: hashPass,
                otp: { token, secret },
            };

            await this.cacheService.setOne(
                SIGNUP_CACHE_KEY(dto.email),
                JSON.stringify(data),
                EMAIL_CODE_TTL_SECONDS,
            );

            const event = new RegisterCodeEvent(dto.email, dto.firstName, token);
            await this.mailQueue.add(AuthMailJobs.SEND_REGISTER_CODE, event, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            });

            return {
                success: true,
                message: 'Код подтверждения отправлен на вашу почту',
            };
        } catch (err) {
            if (err instanceof BaseException) {
                throw err;
            }

            throw new BaseException(
                {
                    code: AuthErrorCodes.SIGNUP_FAILED,
                    message: AuthErrorMessages[AuthErrorCodes.SIGNUP_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
