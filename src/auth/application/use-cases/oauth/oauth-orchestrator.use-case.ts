import { Injectable } from '@nestjs/common';
import { isBaseExceptionWithCode } from '@shared/error';

import { OAuthResponse } from '../../dtos';

import { ConnectOAuthProviderUseCase } from './connect-oauth-provider.use-case';
import { ProcessOAuthLoginUseCase } from './process-oauth-login.use-case';
import { ProcessOAuthRegistrationUseCase } from './process-oauth-registration.use-case';

@Injectable()
export class OAuthOrchestratorUseCase {
    constructor(
        private readonly processLogin: ProcessOAuthLoginUseCase,
        private readonly connectProvider: ConnectOAuthProviderUseCase,
        private readonly processRegistration: ProcessOAuthRegistrationUseCase,
    ) {}

    async execute(dto: OAuthResponse, state?: string) {
        console.log('[OAuth] Start:', {
            provider: dto.provider,
            email: dto.email,
            hasState: !!state,
        });

        if (state) {
            try {
                return this.connectProvider.execute(dto, state);
            } catch (error) {
                if (!isBaseExceptionWithCode(error, 'INVALID_ACTION')) {
                    throw error;
                }
            }
        }

        const login = await this.processLogin.execute(dto).catch((err) => {
            if (isBaseExceptionWithCode(err, 'OAUTH_LOGIN_NOT_FOUND')) {
                return null;
            }

            throw err;
        });

        if (login) {
            return login;
        }

        return this.processRegistration.execute(dto);
    }
}
