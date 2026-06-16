import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';

import { OAuthErrorCodes, OAuthErrorMessages } from '../../../domain/errors';
import { ISessionRepository } from '../../../domain/repository';
import { EXCHANGE_TOKEN_NAME } from '../../../infrastructure/constants';
import { TokenService } from '../../../infrastructure/security';
import { ExchangeDto, type IOAuthExchangeData } from '../../dtos';

import type { DeviceMetadata } from '../../../infrastructure/utils';

@Injectable()
export class ExchangeUseCase {
    constructor(
        @Inject('ISessionRepository')
        private readonly sessionRepo: ISessionRepository,
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        private readonly tokenService: TokenService,
    ) {}

    async execute(dto: ExchangeDto, meta: DeviceMetadata) {
        const key = EXCHANGE_TOKEN_NAME(dto.token);
        const rawData = await this.cacheService.getOne(key);

        if (!rawData) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.EXCHANGE_TOKEN_INVALID,
                    message: OAuthErrorMessages[OAuthErrorCodes.EXCHANGE_TOKEN_INVALID],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const data = JSON.parse(rawData) as IOAuthExchangeData;
        await this.cacheService.removeOne(key);

        if (!data.userId || !data.email) {
            await this.cacheService.removeOne(key);
            throw new BaseException(
                {
                    message: 'Неверный формат данных авторизации',
                    code: 'EXCHANGE_DATA_CORRUPTED',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        try {
            const sessionId = createId();
            const { access, expiresAt, refresh } = await this.tokenService.generateTokens(
                { id: data.userId, email: data.email },
                sessionId,
            );

            const result = await this.sessionRepo.create({
                id: sessionId,
                ...meta,
                expiresAt: expiresAt.toISOString(),
                userId: data.userId,
            });

            if (!result?.id) {
                throw new BaseException(
                    {
                        message: 'Не удалось создать сессию',
                        code: 'SESSION_CREATION_FAILED',
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            return {
                success: true,
                message: 'Вход выполнен успешно',
                access,
                isNewUser: data.isNewUser,
                provider: data.provider,
                refresh,
                expiresAt,
            };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    message: 'Внутренняя ошибка сервера при создании сессии',
                    code: 'SESSION_CREATION_INTERNAL_ERROR',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
