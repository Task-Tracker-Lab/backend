import { FindUserQuery } from '@core/user';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { BaseException } from '@shared/error';
import * as argon from 'argon2';

import { ISessionRepository } from '../../domain/repository';
import { TokenService } from '../../infrastructure/security';
import { DeviceMetadata } from '../../infrastructure/utils/get-device-meta';
import { SignInDto } from '../dtos';

@Injectable()
export class SignInUseCase {
    constructor(
        @Inject('ISessionRepository')
        private readonly sessionRepo: ISessionRepository,
        private readonly tokenService: TokenService,
        private readonly findUserQ: FindUserQuery,
    ) {}

    async execute(dto: SignInDto, meta: DeviceMetadata) {
        const entities = await this.findUserQ.execute({ email: dto.email });

        if (!entities?.user || !entities?.security) {
            throw new BaseException(
                {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Неверный email или пароль',
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const { security, user } = entities;
        // TODO: FIX
        const isPasswordValid = await argon.verify(security.passwordHash ?? '', dto.password);

        if (!isPasswordValid) {
            throw new BaseException(
                {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Неверный email или пароль',
                },
                HttpStatus.UNAUTHORIZED,
            );
        }
        const sessionId = createId();
        const { access, refresh, expiresAt } = await this.tokenService.generateTokens(
            user,
            sessionId,
        );

        await this.sessionRepo.create({
            id: sessionId,
            userId: user.id,
            expiresAt: expiresAt.toISOString(),
            ...meta,
        });

        return {
            success: true,
            tokens: {
                access,
                refresh,
            },
            expiresAt,
            message: 'Вы успешно вошли в систему',
        };
    }
}
