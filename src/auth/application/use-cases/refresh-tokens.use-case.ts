import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { ISessionRepository } from '../../domain/repository';
import { TokenService } from '../../infrastructure/security';
import { DeviceMetadata } from '../../infrastructure/utils/get-device-meta';
import { FindUserQuery } from '@core/user';
import { createId } from '@paralleldrive/cuid2';

@Injectable()
export class RefreshTokensUseCase {
    constructor(
        @Inject('ISessionRepository')
        private readonly sessionRepo: ISessionRepository,
        private readonly tokenService: TokenService,
        private readonly findUserQuery: FindUserQuery,
    ) {}

    async execute(token: string, metadata: DeviceMetadata) {
        const payload = await this.tokenService.validateToken(token, 'refresh');

        if (!payload?.jti) {
            throw new BaseException(
                {
                    code: 'INVALID_TOKEN',
                    message: 'Сессия недействительна или истекла',
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const session = await this.sessionRepo.findById(payload.jti);

        if (!session || session?.isRevoked) {
            throw new BaseException(
                {
                    code: 'SESSION_REVOKED',
                    message: 'Ваша сессия была отозвана или завершена',
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const entity = await this.findUserQuery.execute({ id: session.userId });

        if (!entity?.user) {
            await this.sessionRepo.revoke(session.id);
            throw new BaseException(
                {
                    code: 'USER_NOT_FOUND',
                    message: 'Аккаунт пользователя не найден',
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        await this.sessionRepo.revoke(session.id);

        const sessionId = createId();
        const { access, refresh, expiresAt } = await this.tokenService.generateTokens(
            entity.user,
            sessionId,
        );

        await this.sessionRepo.create({
            id: sessionId,
            userId: entity.user.id,
            ...metadata,
            expiresAt: expiresAt.toISOString(),
        });

        return {
            tokens: { access, refresh },
            success: true,
            expiresAt,
            message: 'Токены успешно обновлены',
        };
    }
}
