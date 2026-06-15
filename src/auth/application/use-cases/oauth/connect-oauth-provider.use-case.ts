import { IIdentityRepository } from '@core/auth/domain/repository';
import { FindUserQuery } from '@core/user';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';
import { OAuthResponse } from '../../dtos';
import { BaseException } from '@shared/error';

@Injectable()
export class ConnectOAuthProviderUseCase {
    constructor(
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        private readonly findUserQ: FindUserQuery,
    ) {}

    async execute(dto: OAuthResponse, state: string) {
        const stateData = await this.getStateData(state);

        this.validateProvider(stateData, dto);

        const user = await this.getUser(stateData.userId);

        await this.validateProviderNotConnected(user.id, dto.provider, dto.id);

        await this.identityRepo.create({
            userId: user.id,
            avatarUrl: dto.avatar_url,
            provider: dto.provider as any,
            providerUserId: dto.id,
            email: dto.email,
        });

        await this.cacheService.removeMany([
            `oauth:user:active:${user.id}`,
            `oauth:state:${state}`,
        ]);

        return { user, isConnect: true, isNewUser: false };
    }

    private async getStateData(state: string) {
        const rawData = await this.cacheService.getOne(`oauth:state:${state}`);
        if (!rawData) {
            throw new BaseException(
                {
                    code: 'INVALID_OR_EXPIRED_STATE',
                    message: 'Сессия подключения недействительна или истекла',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        return JSON.parse(rawData);
    }

    private validateProvider(stateData: any, dto: OAuthResponse) {
        if (stateData.action !== 'connect') {
            throw new BaseException(
                {
                    code: 'INVALID_ACTION',
                    message: 'Этот state не предназначен для подключения провайдера',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        if (stateData.provider !== dto.provider) {
            throw new BaseException(
                {
                    code: 'PROVIDER_MISMATCH',
                    message: `Провайдер в запросе (${dto.provider}) не совпадает с ожидаемым (${stateData.provider})`,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    private async getUser(userId: string) {
        const result = await this.findUserQ.execute({ id: userId });

        if (!result?.user) {
            throw new BaseException(
                {
                    code: 'USER_NOT_FOUND',
                    message: 'Пользователь для подключения провайдера не найден',
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return result.user;
    }

    private async validateProviderNotConnected(
        userId: string,
        provider: string,
        providerUserId: string,
    ) {
        const existingIdentity = await this.identityRepo.findByProvider(
            provider as any,
            providerUserId,
        );

        if (existingIdentity && existingIdentity.userId !== userId) {
            throw new BaseException(
                {
                    code: 'PROVIDER_ALREADY_USED',
                    message: `Этот ${provider} аккаунт уже привязан к другому пользователю`,
                },
                HttpStatus.CONFLICT,
            );
        }

        const userIdentities = await this.identityRepo.findAllByUserId(userId);
        const alreadyConnected = userIdentities.some((i) => i.provider === provider);

        if (alreadyConnected) {
            throw new BaseException(
                {
                    code: 'PROVIDER_ALREADY_CONNECTED',
                    message: `Провайдер ${provider} уже привязан к вашему аккаунту`,
                },
                HttpStatus.CONFLICT,
            );
        }
    }
}
