import { IUserRepository } from '@core/user/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { BaseException } from '@shared/error';

import { UserErrorCodes, UserErrorMessages } from '../../domain/errors';

import type { NewUser } from '@core/user/domain/entities';

@Injectable()
export class RegisterUserUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly repository: IUserRepository,
    ) {}

    async execute(dto: NewUser & { password: string | null }) {
        const existingUser = await this.repository.findByEmail(dto.email);

        if (existingUser?.user) {
            throw new BaseException(
                {
                    code: UserErrorCodes.ALREADY_EXISTS,
                    message: UserErrorMessages[UserErrorCodes.ALREADY_EXISTS],
                    details: [{ target: 'email', value: dto.email }],
                },
                HttpStatus.CONFLICT,
            );
        }

        try {
            const user = await this.repository.create(dto);

            if (dto.password) {
                await Promise.all([
                    this.repository.logActivity({
                        eventType: 'registered',
                        userId: user.id,
                        id: createId(),
                    }),
                    this.repository.updatePasswordHash(user.id, dto.password),
                ]);
            }

            return user;
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: UserErrorCodes.CREATE_FAILED,
                    message: UserErrorMessages[UserErrorCodes.CREATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
