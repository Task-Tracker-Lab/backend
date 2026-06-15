import { HttpStatus, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BaseException } from '@shared/error';

@Injectable()
export class OAuthGuard implements CanActivate {
    private readonly guardClasses: Record<'google' | 'github' | 'yandex' | 'vkontakte', any> = {
        google: AuthGuard('google-oauth'),
        github: AuthGuard('github-oauth'),
        yandex: AuthGuard('yandex-oauth'),
        vkontakte: AuthGuard('vkontakte-oauth'),
    };

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const provider = request.params.provider;
        const query = request.query.state;

        if (!this.isSupportedProvider(provider)) {
            throw new BaseException(
                {
                    code: 'INVALID_OAUTH_PROVIDER',
                    message: `OAuth провайдер "${provider}" не поддерживается`,
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const GuardClass = this.guardClasses[provider];

        const passportOptions: Record<string, boolean | string> = { session: false };

        if (query) {
            passportOptions['state'] = query;
        }

        if (provider === 'google') {
            passportOptions['accessType'] = 'offline';
            passportOptions['prompt'] = 'consent';
        }

        const targetGuard = new GuardClass(passportOptions);

        try {
            const result = await targetGuard.canActivate(context);
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            throw new BaseException(
                {
                    code: 'OAUTH_AUTHENTICATION_FAILED',
                    message: `Ошибка авторизации через ${provider}: ${message || 'Неизвестная ошибка'}`,
                },
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    private isSupportedProvider(provider: string): provider is keyof OAuthGuard['guardClasses'] {
        return (
            provider === 'google' ||
            provider === 'github' ||
            provider === 'yandex' ||
            provider === 'vkontakte'
        );
    }
}
