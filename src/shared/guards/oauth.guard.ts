import { HttpStatus, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { BaseException } from '@shared/error';

import type { FastifyReply } from 'fastify';

@Injectable()
export class OAuthGuard implements CanActivate {
    constructor(private readonly cfg: ConfigService) {}

    private readonly guardClasses: Record<'google' | 'github' | 'yandex' | 'vkontakte', any> = {
        google: AuthGuard('google-oauth'),
        github: AuthGuard('github-oauth'),
        yandex: AuthGuard('yandex-oauth'),
        vkontakte: AuthGuard('vkontakte-oauth'),
    };

    async canActivate(context: ExecutionContext) {
        const response = context.switchToHttp().getResponse<FastifyReply>();
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

        const passportOptions: Record<string, boolean | string> = {
            session: false,
            ...(query && { state: query }),
            ...(provider === 'google' && {
                accessType: 'offline',
                prompt: 'consent',
            }),
        };

        const targetGuard = new GuardClass(passportOptions);

        try {
            const result = await targetGuard.canActivate(context);
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            const domain = this.cfg.get('DOMAIN');
            const baseUrl = domain ? `https://${domain}` : '';

            const query = new URLSearchParams({
                success: 'false',
                error: 'OAUTH_AUTHENTICATION_FAILED',
                message: `Ошибка авторизации через ${provider}: ${message || 'Неизвестная ошибка'}`,
            });

            return response.redirect(`${baseUrl}/oauth?${query.toString()}`, 302);
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
