import { FindUserQuery, RegisterUserUseCase } from '@core/user';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import { Queue } from 'bullmq';

import { AuthQueues, AuthUserJobs } from '../../../domain/enums';
import { OAuthErrorCodes, OAuthErrorMessages } from '../../../domain/errors';
import { CreateUserWorkspaceEvent } from '../../../domain/events';
import { IIdentityRepository, ISessionRepository } from '../../../domain/repository';
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
        @InjectQueue(AuthQueues.AUTH_USER)
        private readonly queue: Queue,
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
        private readonly tokenService: TokenService,
        private readonly registerUserUC: RegisterUserUseCase,
        private readonly findUserQ: FindUserQuery,
    ) {}

    async execute(dto: ExchangeDto, meta: DeviceMetadata) {
        const data = await this.validateAndGetData(dto);

        const { user, isNewUser } = await this.processUser(data);
        const tokens = await this.createSession(user.id, user.email, meta);

        if (isNewUser) {
            const event = new CreateUserWorkspaceEvent(user.id);
            await this.queue.add(AuthUserJobs.CREATE_WORKSPACE, event);
        }

        return {
            success: true,
            message: isNewUser ? 'Регистрация выполнена успешно' : 'Вход выполнен успешно',
            access: tokens.access,
            refresh: tokens.refresh,
            expiresAt: tokens.expiresAt,
            isNewUser,
            provider: data.provider,
        };
    }

    private async validateAndGetData(dto: ExchangeDto) {
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

        const data: IOAuthExchangeData = JSON.parse(rawData);
        await this.cacheService.removeOne(key);

        if (!data.email || !data.provider) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.DATA_CORRUPTION,
                    message: OAuthErrorMessages[OAuthErrorCodes.DATA_CORRUPTION],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        if (data.provider !== dto.provider) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.EXCHANGE_TOKEN_INVALID,
                    message: OAuthErrorMessages[OAuthErrorCodes.EXCHANGE_TOKEN_INVALID],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        return data;
    }

    private async processUser(data: IOAuthExchangeData) {
        const identity = await this.identityRepo.findByProvider(data.provider, data.id);

        if (identity) {
            const entity = await this.findUserQ.execute(
                { email: data.email },
                { throwIfNotFound: true },
            );

            return { user: entity.user, isNewUser: false };
        }

        return this.register(data);
    }

    private async register(data: IOAuthExchangeData) {
        const user = await this.registerUserUC.execute({
            email: data.email,
            firstName: data.first_name || 'User',
            lastName: data.last_name ?? '',
            password: null,
            bio: data.bio,
            gender: data.sex || 'none',
            avatarUrl: data.avatar_url,
        });

        await this.identityRepo.create({
            userId: user.id,
            avatarUrl: data.avatar_url,
            provider: data.provider,
            providerUserId: data.id,
            email: data.email,
        });

        return { user, isNewUser: true };
    }

    private async createSession(userId: string, email: string, meta: DeviceMetadata) {
        const sessionId = createId();

        const tokens = await this.tokenService.generateTokens({ id: userId, email }, sessionId);

        const result = await this.sessionRepo.create({
            id: sessionId,
            ...meta,
            expiresAt: tokens.expiresAt.toISOString(),
            userId,
        });

        if (!result?.id) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.SESSION_CREATION_FAILED,
                    message: OAuthErrorMessages[OAuthErrorCodes.SESSION_CREATION_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return tokens;
    }
}
