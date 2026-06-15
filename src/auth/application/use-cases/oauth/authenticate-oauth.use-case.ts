import crypto from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { CACHE_SERVICE } from '@shared/adapters/cache/constants';
import { ICacheService } from '@shared/adapters/cache/ports';

import { EXCHANGE_TOKEN_NAME, EXCHANGE_TOKEN_TTL } from '../../../infrastructure/constants';

import { OAuthOrchestratorUseCase } from './oauth-orchestrator.use-case';

import type { OAuthResponse } from '../../dtos';
import type { DeviceMetadata } from '@core/auth/infrastructure/utils';

@Injectable()
export class AuthenticateOAuthUseCase {
    constructor(
        @Inject(CACHE_SERVICE)
        private readonly cacheService: ICacheService,
        private readonly orchestrator: OAuthOrchestratorUseCase,
    ) {}

    async execute(dto: OAuthResponse, meta: DeviceMetadata, state?: string) {
        const { user, isNewUser, isConnect } = await this.orchestrator.execute(dto, state);

        if (isConnect) {
            const query = new URLSearchParams({
                success: 'true',
                message: `Провайдер ${dto.provider} успешно привязан`,
            });

            return {
                query,
                isSign: false,
                refresh: null,
                expiresAt: null,
            };
        }
        const token = crypto.randomBytes(32).toString('hex');

        const data = {
            userId: user.id,
            isNewUser,
            email: user.email,
            provider: dto.provider,
            ip: meta.ip,
        };

        await this.cacheService.setOne(
            EXCHANGE_TOKEN_NAME(token),
            JSON.stringify(data),
            EXCHANGE_TOKEN_TTL,
        );

        const query = new URLSearchParams({
            token,
        });

        return { query, isSign: true };
    }
}
