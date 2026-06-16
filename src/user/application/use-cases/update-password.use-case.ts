import { IUserRepository } from '@core/user/domain/repository';
import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { BaseException } from '@shared/error';

import { UserErrorCodes, UserErrorMessages } from '../../domain/errors';

@Injectable()
export class UpdatePasswordUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly repository: IUserRepository,
    ) {}

    async execute(email: string, password: string) {
        const result = await this.repository.findByEmail(email);

        if (!result?.user) {
            throw new BaseException(
                {
                    code: UserErrorCodes.NOT_FOUND,
                    message: UserErrorMessages[UserErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        try {
            return this.repository.updatePasswordHash(result.user.id, password);
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: UserErrorCodes.UPDATE_FAILED,
                    message: UserErrorMessages[UserErrorCodes.UPDATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
