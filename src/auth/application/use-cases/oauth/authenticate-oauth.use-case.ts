import { ISessionRepository } from '@core/auth/domain/repository';
import { TokenService } from '@core/auth/infrastructure/security';
import { Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { OAuthOrchestratorUseCase } from './oauth-orchestrator.use-case';

import type { OAuthResponse } from '../../dtos';
import type { DeviceMetadata } from '@core/auth/infrastructure/utils';

@Injectable()
export class AuthenticateOAuthUseCase {
    constructor(
        private readonly orchestrator: OAuthOrchestratorUseCase,
        @Inject('ISessionRepository')
        private readonly sessionRepo: ISessionRepository,
        private readonly tokenService: TokenService,
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

        const sessionId = createId();
        const { access, expiresAt, refresh } = await this.tokenService.generateTokens(
            user,
            sessionId,
        );

        await this.sessionRepo.create({
            id: sessionId,
            ...meta,
            expiresAt: expiresAt.toISOString(),
            userId: user.id,
        });

        const query = new URLSearchParams({
            success: 'true',
            message: isNewUser ? 'Регистрация успешна' : 'Вход успешен',
            access,
            provider: dto.provider,
            isNewUser: String(isNewUser),
        });

        return { query, refresh, expiresAt, isSign: true };
    }
}
