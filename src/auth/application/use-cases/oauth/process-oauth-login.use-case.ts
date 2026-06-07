import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { OAuthResponse } from '../../dtos';
import { IIdentitiesRepository } from '@core/auth/domain/repository';
import { FindUserQuery } from '@core/user';
import { BaseException } from '@shared/error';

@Injectable()
export class ProcessOAuthLoginUseCase {
    constructor(
        @Inject('IIdentitiesRepository')
        private readonly identitiesRepo: IIdentitiesRepository,
        private readonly findUserQuery: FindUserQuery,
    ) {}

    async execute(dto: OAuthResponse) {
        const identity = await this.identitiesRepo.findByProvider(dto.provider as any, dto.id);

        if (!identity) {
            throw new BaseException(
                {
                    code: 'OAUTH_LOGIN_NOT_FOUND',
                    message: 'Пользователь с таким OAuth аккаунтом не найден',
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const result = await this.findUserQuery.execute({ id: identity.userId });

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
