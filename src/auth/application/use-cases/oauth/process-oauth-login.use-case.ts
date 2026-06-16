import { IIdentityRepository } from '@core/auth/domain/repository';
import { FindUserQuery } from '@core/user';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { OAuthErrorCodes, OAuthErrorMessages } from '../../../domain/errors';
import { OAuthResponse } from '../../dtos';

@Injectable()
export class ProcessOAuthLoginUseCase {
    constructor(
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
        private readonly findUserQ: FindUserQuery,
    ) {}

    async execute(dto: OAuthResponse) {
        const identity = await this.identityRepo.findByProvider(dto.provider as any, dto.id);

        if (!identity) {
            throw new BaseException(
                {
                    code: OAuthErrorCodes.OAUTH_LOGIN_NOT_FOUND,
                    message: OAuthErrorMessages[OAuthErrorCodes.OAUTH_LOGIN_NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const result = await this.findUserQ.execute({ id: identity.userId });

        return {
            user: result.user,
            isNewUser: false,
            isConnect: false,
        };
    }
}
