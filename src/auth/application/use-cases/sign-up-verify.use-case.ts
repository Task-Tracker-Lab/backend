import { SignUpCacheData } from '@core/auth/application/interfaces';
import { AuthQueues } from '@core/auth/domain/enums';
import { AuthUserJobs } from '@core/auth/domain/enums/auth-jobs.enum';
import { CreateUserWorkspaceEvent } from '@core/auth/domain/events/create-user-workspace.event';
import { SIGNUP_CACHE_KEY } from '@core/auth/infrastructure/constants';
import { RegisterUserUseCase } from '@core/user';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import { Queue } from 'bullmq';
import { verify as verifyOTP } from 'otplib';

import { ISessionRepository } from '../../domain/repository';
import { TokenService } from '../../infrastructure/security';
import { DeviceMetadata } from '../../infrastructure/utils/get-device-meta';
import { VerifyDto } from '../dtos';

@Injectable()
export class SignUpVerifyUseCase {
    constructor(
        @InjectQueue(AuthQueues.AUTH_USER)
        private readonly queue: Queue,
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @Inject('ISessionRepository')
        private readonly sessionRepo: ISessionRepository,
        private readonly tokenService: TokenService,
        private readonly registerUserUC: RegisterUserUseCase,
    ) {}

    async execute(dto: VerifyDto, meta: DeviceMetadata) {
        const cachedData = await this.cacheService.getOne(SIGNUP_CACHE_KEY(dto.email));

        if (!cachedData) {
            throw new BaseException(
                {
                    code: 'REGISTRATION_EXPIRED',
                    message: 'Срок регистрации истек или email не найден. Попробуйте снова.',
                },
                HttpStatus.GONE,
            );
        }

        const userData: SignUpCacheData = JSON.parse(cachedData);

        if (!userData) {
            throw new BaseException(
                {
                    code: 'INTERNAL_DATA_CORRUPTION',
                    message: 'Ошибка целостности данных. Попробуйте начать регистрацию заново.',
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        if (userData.otp.token !== dto.code) {
            throw new BaseException(
                {
                    code: 'INVALID_OTP',
                    message: 'Неверный или истекший код подтверждения',
                    details: [{ target: 'code', message: 'OTP code is invalid or expired' }],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const verifyResult = await verifyOTP({
            token: dto.code,
            secret: userData.otp.secret,
            algorithm: 'sha256',
            digits: 6,
            period: 900,
            strategy: 'totp',
            afterTimeStep: 1,
        });

        if (!verifyResult.valid) {
            throw new BaseException(
                {
                    code: 'INVALID_OTP',
                    message: 'Неверный или истекший код подтверждения',
                    details: [{ target: 'code', message: 'OTP code is invalid or expired' }],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const user = await this.registerUserUC.execute({
            ...userData.user,
            emailVerified: true,
            emailVerifiedAt: new Date().toISOString(),
            password: userData.password,
        });

        const sessionId = createId();
        const { access, refresh, expiresAt } = await this.tokenService.generateTokens(
            user,
            sessionId,
        );

        await this.sessionRepo.create({
            id: sessionId,
            userId: user.id,
            ...meta,
            expiresAt: expiresAt.toISOString(),
        });

        await this.cacheService.removeOne(SIGNUP_CACHE_KEY(dto.email));

        const event = new CreateUserWorkspaceEvent(user.id, user.firstName);
        await this.queue.add(AuthUserJobs.CREATE_WORKSPACE, event);

        return {
            success: true,
            tokens: { access, refresh },
            expiresAt,
            message: 'Аккаунт успешно подтвержден',
        };
    }
}
