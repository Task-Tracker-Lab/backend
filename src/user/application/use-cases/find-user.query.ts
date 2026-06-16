import { IUserRepository } from '@core/user/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { UserErrorCodes, UserErrorMessages } from '../../domain/errors';

import type { UserWithSecurity } from '../../domain/entities';

type TParams = {
    email?: string;
    id?: string;
};

@Injectable()
export class FindUserQuery {
    constructor(
        @Inject('IUserRepository')
        private readonly repository: IUserRepository,
    ) {}

    async execute(
        params: TParams,
        options?: { throwIfNotFound?: true; throwIfExists?: false },
    ): Promise<UserWithSecurity>;
    async execute(
        params: TParams,
        options: { throwIfNotFound: false; throwIfExists?: boolean },
    ): Promise<UserWithSecurity | null>;
    async execute(
        params: TParams,
        options: { throwIfExists: true; throwIfNotFound?: boolean },
    ): Promise<UserWithSecurity>;
    async execute(
        params: TParams,
        options?: { throwIfNotFound?: boolean; throwIfExists?: boolean },
    ): Promise<UserWithSecurity | null> {
        const { throwIfNotFound = true, throwIfExists = false } = options || {};

        if (!params.email && !params.id) {
            throw new BaseException(
                {
                    code: UserErrorCodes.QUERY_PARAMS_MISSING,
                    message: UserErrorMessages[UserErrorCodes.QUERY_PARAMS_MISSING],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const result = params.email
            ? await this.repository.findByEmail(params.email)
            : await this.repository.findById(params.id!);

        if (!result && throwIfNotFound) {
            throw new BaseException(
                {
                    code: UserErrorCodes.NOT_FOUND,
                    message: UserErrorMessages[UserErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (result && throwIfExists) {
            throw new BaseException(
                {
                    code: UserErrorCodes.ALREADY_EXISTS,
                    message: UserErrorMessages[UserErrorCodes.ALREADY_EXISTS],
                },
                HttpStatus.CONFLICT,
            );
        }

        return result;
    }
}
