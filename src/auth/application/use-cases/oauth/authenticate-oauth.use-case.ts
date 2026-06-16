import { Injectable } from '@nestjs/common';
import { isBaseExceptionWithCode } from '@shared/error';

import { ConnectOAuthProviderUseCase } from './connect-oauth-provider.use-case';
import { ProcessOAuthSignUseCase } from './process-oauth-sign.use-case';

import type { OAuthResponse } from '../../dtos';
import type { DeviceMetadata } from '@core/auth/infrastructure/utils';

@Injectable()
export class AuthenticateOAuthUseCase {
    constructor(
        private readonly processSign: ProcessOAuthSignUseCase,
        private readonly connectProvider: ConnectOAuthProviderUseCase,
    ) {}

    async execute(dto: OAuthResponse, meta: DeviceMetadata, state?: string) {
        if (state) {
            try {
                return this.connectProvider.execute(dto, state);
            } catch (error) {
                if (!isBaseExceptionWithCode(error, 'INVALID_ACTION')) {
                    throw error;
                }
            }
        }

        return this.processSign.execute(dto, meta);
    }
}
