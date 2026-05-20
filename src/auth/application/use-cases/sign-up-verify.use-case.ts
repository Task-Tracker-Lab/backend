import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { verify as verifyOTP } from 'otplib';
import { RegisterUserUseCase } from '@core/user';
import { BaseException } from '@shared/error';
import { ISessionRepository } from '../../domain/repository';
import { TokenService } from '../../infrastructure/security';
import { DeviceMetadata } from '../../infrastructure/utils/get-device-meta';
import { VerifyDto } from '../dtos';
import { createId } from '@paralleldrive/cuid2';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';

@Injectable()
export class SignUpVerifyUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @Inject('ISessionRepository')
        private readonly sessionRepo: ISessionRepository,
        private readonly tokenService: TokenService,
        private readonly registerUserUseCase: RegisterUserUseCase,
    ) {}

    async execute(dto: VerifyDto, meta: DeviceMetadata) {
        const redisKey = `reg:${dto.email}`;
        const cachedData = await this.cacheService.getOne(redisKey);

        if (!cachedData) {
            throw new BaseException(
                {
                    code: 'REGISTRATION_EXPIRED',
                    message: 'Срок регистрации истек или email не найден. Попробуйте снова.',
                },
                HttpStatus.GONE,
            );
        }

        const userData = JSON.parse(cachedData);

        if (!userData) {
            throw new BaseException(
                {
                    code: 'INTERNAL_DATA_CORRUPTION',
                    message: 'Ошибка целостности данных. Попробуйте начать регистрацию заново.',
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
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

        const user = await this.registerUserUseCase.execute({
            ...userData.user,
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

        await this.cacheService.removeOne(redisKey);

        return {
            success: true,
            tokens: { access, refresh },
            expiresAt,
            message: 'Аккаунт успешно подтвержден',
        };
    }
}
