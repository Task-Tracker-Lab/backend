import { IIdentityRepository } from '@core/auth/domain/repository';
import { FindUserQuery } from '@core/user';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { OAuthErrorCodes, OAuthErrorMessages } from '../../../domain/errors';

@Injectable()
export class DisconnectProviderUseCase {
    constructor(
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
        private readonly findUserQ: FindUserQuery,
    ) {}

    async execute(provider: string, userId: string) {
        const entity = await this.findUserQ.execute({ id: userId });

        const providers = await this.identityRepo.findAllByUserId(entity.user.id);
        const targetProvider = providers.find((p) => p.provider === provider);

        if (!targetProvider) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.PROVIDER_NOT_LINKED,
                    message: OAuthErrorMessages[OAuthErrorCodes.PROVIDER_NOT_LINKED],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const hasPassword =
            entity.security.passwordHash !== null && entity.security.passwordHash !== '';
        const hasOtherProviders = providers.length > 1;

        if (!hasOtherProviders && !hasPassword) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.LAST_AUTH_METHOD_CANNOT_BE_REMOVED,
                    message: OAuthErrorMessages[OAuthErrorCodes.LAST_AUTH_METHOD_CANNOT_BE_REMOVED],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.identityRepo.delete(targetProvider.id);

        return {
            success: true,
            message: `Провайдер ${provider} успешно отвязан`,
        };
    }
}
