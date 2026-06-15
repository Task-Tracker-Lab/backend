import { Injectable } from '@nestjs/common';
import { BaseException, type IErrorOptions } from '@shared/error';

import { OAuthResponse } from '../../dtos';

import { ConnectOAuthProviderUseCase } from './connect-oauth-provider.use-case';
import { ProcessOAuthLoginUseCase } from './process-oauth-login.use-case';
import { ProcessOAuthRegistrationUseCase } from './process-oauth-registration.use-case';

// TODO: ADD TO GLOBAL
function isBaseException(error: unknown): error is BaseException {
    return error instanceof BaseException;
}

function isBaseExceptionWithCode(error: unknown, code: string): error is BaseException {
    return isBaseException(error) && (error.getResponse() as IErrorOptions).code === code;
}

@Injectable()
export class OAuthOrchestratorUseCase {
    constructor(
        private readonly processLogin: ProcessOAuthLoginUseCase,
        private readonly connectProvider: ConnectOAuthProviderUseCase,
        private readonly processRegistration: ProcessOAuthRegistrationUseCase,
    ) {}

    async execute(dto: OAuthResponse, state?: string) {
        if (state) {
            try {
                return this.connectProvider.execute(dto, state);
            } catch (error) {
                if (!isBaseExceptionWithCode(error, 'INVALID_ACTION')) {
                    throw error;
                }
            }
        }

        try {
            return this.processLogin.execute(dto);
        } catch (error) {
            if (!isBaseExceptionWithCode(error, 'OAUTH_LOGIN_NOT_FOUND')) {
                throw error;
            }
        }

        return this.processRegistration.execute(dto);
    }
}
