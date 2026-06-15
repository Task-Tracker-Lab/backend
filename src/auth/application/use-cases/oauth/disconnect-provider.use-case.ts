import { IIdentityRepository } from '@core/auth/domain/repository';
import { FindUserQuery } from '@core/user';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseException } from '@shared/error';

@Injectable()
export class DisconnectProviderUseCase {
    constructor(
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
        private readonly findUserQ: FindUserQuery,
    ) {}

    async execute(provider: string, userId: string) {
        const entity = await this.findUserQ.execute({ id: userId });

        if (!entity?.user) {
            throw new BaseException(
                {
                    code: 'USER_NOT_FOUND',
                    message: 'Пользователь не найден',
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const providers = await this.identityRepo.findAllByUserId(entity.user.id);
        const targetProvider = providers.find((p) => p.provider === provider);

        if (!targetProvider) {
            throw new BaseException(
                {
                    code: 'PROVIDER_NOT_LINKED',
                    message: `Провайдер ${provider} не привязан к пользователю`,
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
                    message:
                        'Нельзя удалить последний способ входа. Пожалуйста, установите пароль или добавьте другой провайдер.',
                    code: 'LAST_AUTH_METHOD_CANNOT_BE_REMOVED',
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
