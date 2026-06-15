import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { FindUserQuery } from '@core/user';
import { createId } from '@paralleldrive/cuid2';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { BaseException } from '@shared/error';
import { IIdentityRepository } from '@core/auth/domain/repository';

@Injectable()
export class ConnectProviderUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
        private readonly findUserQ: FindUserQuery,
    ) {}

    private readonly STATE_TTL = 180; // 3 минуты
    private readonly ACTIVE_SESSION_KEY = (userId: string) => `oauth:user:active:${userId}`;
    private readonly STATE_KEY = (state: string) => `oauth:state:${state}`;

    async execute(provider: string, userId: string) {
        await this.validateUser(userId);
        await this.validateProviderNotConnected(userId, provider);
        await this.validateNoActiveSession(userId, provider);

        const stateCode = createId();
        const stateData = {
            code: stateCode,
            provider,
            userId,
            action: 'connect',
            createdAt: Date.now(),
        };

        await this.cacheService.setOne(
            this.STATE_KEY(stateCode),
            JSON.stringify(stateData),
            this.STATE_TTL,
        );

        const activeSession = {
            provider,
            stateCode,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.STATE_TTL * 1000,
        };

        await this.cacheService.setOne(
            this.ACTIVE_SESSION_KEY(userId),
            JSON.stringify(activeSession),
            this.STATE_TTL,
        );

        return { success: true, url: `/v1/auth/oauth/${provider}?state=${stateCode}` };
    }

    private async validateUser(userId: string) {
        const entity = await this.findUserQ.execute({ id: userId });
        if (!entity?.user) {
            throw new BaseException(
                {
                    code: 'USER_NOT_FOUND',
                    message: 'Пользователь не найден',
                },
                HttpStatus.NOT_FOUND,
            );
        }
    }

    private async validateProviderNotConnected(userId: string, provider: string) {
        const identities = await this.identityRepo.findAllByUserId(userId);
        const isConnected = identities.some((identity) => identity.provider === provider);

        if (isConnected) {
            throw new BaseException(
                {
                    code: 'PROVIDER_ALREADY_CONNECTED',
                    message: `Провайдер "${this.getProviderName(provider)}" уже подключен к аккаунту`,
                },
                HttpStatus.CONFLICT,
            );
        }
    }

    private async validateNoActiveSession(userId: string, newProvider: string) {
        const activeSessionRaw = await this.cacheService.getOne(this.ACTIVE_SESSION_KEY(userId));

        if (activeSessionRaw) {
            const activeSession = JSON.parse(activeSessionRaw);
            const timeLeft = Math.ceil((activeSession.expiresAt - Date.now()) / 1000);
            const minutesLeft = Math.floor(timeLeft / 60);
            const secondsLeft = timeLeft % 60;

            let timeMessage = '';
            if (minutesLeft > 0) {
                timeMessage = `${minutesLeft} мин ${secondsLeft} сек`;
            } else {
                timeMessage = `${secondsLeft} сек`;
            }

            const isSameProvider = activeSession.provider === newProvider;
            const providerName = this.getProviderName(activeSession.provider);

            let message = '';
            if (isSameProvider) {
                message = `У вас уже есть активный процесс авторизации через ${providerName}. Подождите ${timeMessage} или завершите его в другом окне.`;
            } else {
                message = `У вас уже есть активный процесс авторизации через ${providerName}. Дождитесь его завершения (${timeMessage}) или отмените, чтобы начать через ${this.getProviderName(newProvider)}.`;
            }

            throw new BaseException(
                {
                    code: 'ACTIVE_OAUTH_SESSION_EXISTS',
                    message,
                    details: [
                        {
                            activeProvider: activeSession.provider,
                            requestedProvider: newProvider,
                            isSameProvider,
                            timeLeftSeconds: timeLeft,
                            expiresAt: activeSession.expiresAt,
                            stateCode: activeSession.stateCode,
                        },
                    ],
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
    }

    private getProviderName(provider: string): string {
        const names: Record<string, string> = {
            google: 'Google',
            github: 'GitHub',
            facebook: 'Facebook',
            yandex: 'Яндекс',
            vk: 'VK',
        };
        return names[provider] || provider;
    }
}
