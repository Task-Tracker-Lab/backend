import { UpdatePasswordUseCase } from '@core/user';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import * as argon from 'argon2';

import { AuthErrorCodes, AuthErrorMessages } from '../../../domain/errors';
import { PasswordResetConfirmDto } from '../../dtos';

@Injectable()
export class ConfirmResetPasswordUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        private readonly updatePasswordUserUC: UpdatePasswordUseCase,
    ) {}

    async execute(dto: PasswordResetConfirmDto) {
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
            const hashed = await argon.hash(dto.password);
            const result = await this.updatePasswordUserUC.execute(dto.email, hashed);

            await this.cacheService.removeOne(redisKey);

            return {
                success: result,
                message: 'Пароль успешно изменен. Теперь вы можете войти в аккаунт.',
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
