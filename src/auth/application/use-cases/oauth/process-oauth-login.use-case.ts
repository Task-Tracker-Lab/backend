import { IIdentityRepository } from '@core/auth/domain/repository';
import { FindUserQuery } from '@core/user';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

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
                    code: 'OAUTH_LOGIN_NOT_FOUND',
                    message: 'Пользователь с таким OAuth аккаунтом не найден',
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const result = await this.findUserQ.execute({ id: identity.userId });

        if (!result?.user) {
            throw new BaseException(
                {
                    code: 'USER_NOT_FOUND',
                    message: 'Пользователь не найден',
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return {
            user: result.user,
            isNewUser: false,
            isConnect: false,
        };
    }
}
