import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { generate, generateSecret } from 'otplib';
import { BaseException } from '@shared/error';
import { AuthMailJobs, AuthQueues } from '../../domain/enums';
import { ResetPasswordEvent } from '../../domain/events';
import { ResetPasswordDto } from '../dtos';
import { FindUserQuery } from '@core/user';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { RESET_PASSWORD_CACHE_KEY } from '@core/auth/infrastructure/constants';
import { ResetPasswordCacheData } from '@core/auth/application/interfaces';

@Injectable()
export class ResetPasswordUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @InjectQueue(AuthQueues.AUTH_MAIL)
        private readonly mailQueue: Queue,
        private readonly findUserQuery: FindUserQuery,
    ) {}

    async execute(dto: ResetPasswordDto) {
        const isExistsAttempt = await this.cacheService.getOne(RESET_PASSWORD_CACHE_KEY(dto.email));

        if (isExistsAttempt) {
            throw new BaseException(
                {
                    code: 'PASS_RESET_ATTEMPT_ACTIVE',
                    message:
                        'Запрос на сброс пароля уже активен. Проверьте почту или попробуйте позже.',
                    details: [
                        {
                            target: 'email',
                            value: dto.email,
                        },
                    ],
                },
                HttpStatus.CONFLICT,
            );
        }

        const entity = await this.findUserQuery.execute({ email: dto.email });

        if (!entity?.user) {
            throw new BaseException(
                {
                    code: 'USER_NOT_FOUND',
                    message: 'Пользователь с таким email не найден',
                    details: [{ target: 'email', value: dto.email }],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const secret = generateSecret();
        const token = await generate({
            secret,
            digits: 6,
            period: 900,
            strategy: 'totp',
        });

        const resetPayload: ResetPasswordCacheData = {
            email: entity.user.email,
            otp: { secret, token },
            isVerified: false,
        };

        await this.cacheService.setOne(
            RESET_PASSWORD_CACHE_KEY(dto.email),
            JSON.stringify(resetPayload),
            900,
        );

        const event = new ResetPasswordEvent(dto.email, token);
        await this.mailQueue.add(AuthMailJobs.SEND_RESET_PASSWORD, event, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        });

        return {
            success: true,
            message: 'Код для восстановления пароля отправлен на вашу почту',
        };
    }
}
