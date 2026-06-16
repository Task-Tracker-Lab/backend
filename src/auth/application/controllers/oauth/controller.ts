import { getDeviceMeta } from '@core/auth/infrastructure/utils';
import {
    Body,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBaseController, GetUserId, SkipContract } from '@shared/decorators';
import { type IErrorOptions, isBaseException } from '@shared/error';
import { BearerAuthGuard, OAuthGuard } from '@shared/guards';

import { AuthFacade } from '../../auth.facade';
import { ExchangeDto, type TOAuthResponse } from '../../dtos';

import {
    DisconnectOAuthProviderSwagger,
    GetConnectedProvidersSwagger,
    ConnectOAuthProviderSwagger,
    GetOAuthProvidersSwagger,
    OAuthCallbackSwagger,
    OAuthLoginSwagger,
    ExchangeSwagger,
} from './swagger';

import type { FastifyReply, FastifyRequest } from 'fastify';

@ApiBaseController('oauth', 'OAuth')
export class OAuthController {
    private readonly isProduction: boolean = false;
    private readonly domain?: string | null = null;

    constructor(
        private readonly facade: AuthFacade,
        private readonly cfg: ConfigService,
    ) {
        this.isProduction = this.cfg.get('NODE_ENV') === 'production';
        this.domain = this.cfg.get('DOMAIN');
    }

    @Get(':provider')
    @OAuthLoginSwagger()
    @UseGuards(OAuthGuard)
    @SkipContract()
    async oauthLogin() {}

    @Get(':provider/callback')
    @OAuthCallbackSwagger()
    @UseGuards(OAuthGuard)
    @SkipContract()
    async oauthCallback(
        @Query() query: { code?: string; state?: string },
        @Param('provider') provider: 'google' | 'yandex' | 'github' | 'vkontakte',
        @Res({ passthrough: true }) res: FastifyReply,
        @Req() req: FastifyRequest,
    ) {
        const meta = getDeviceMeta(req);
        const body = req.user as unknown as TOAuthResponse;
        const state = query?.state;
        const baseUrl = `https://dev.${this.domain}`;

        try {
            const dto = {
                provider,
                id: body.id,
                first_name: body.first_name,
                last_name: body.last_name,
                email: body.email,
                avatar_url: body.avatar_url,
                sex: body.sex,
                bio: body.bio,
            };

            const result = await this.facade.authenticateOAuth(dto, meta, state);

            if (result.isSign) {
                res.redirect(`${baseUrl}/oauth?${result.query.toString()}`, 302);
            } else {
                res.redirect(`${baseUrl}/user/profile?${result.query.toString()}`, 302);
            }
        } catch (err) {
            let message = 'Произошла ошибка при авторизации';
            let code = 'OAUTH_ERROR';

            if (isBaseException(err)) {
                const response = err.getResponse() as IErrorOptions;
                message = response.message || message;
                code = response.code || code;
            }

            if (err instanceof Error) {
                message = err.message || message;
            }

            const errorQuery = new URLSearchParams({
                success: 'false',
                message,
                code,
            });

            res.redirect(`${baseUrl}/oauth?${errorQuery.toString()}`, 302);
        }
    }

    @Post('exchange')
    @ExchangeSwagger()
    @HttpCode(200)
    async exchange(
        @Body() dto: ExchangeDto,
        @Res({ passthrough: true }) res: FastifyReply,
        @Req() req: FastifyRequest,
    ) {
        const meta = getDeviceMeta(req);

        const { expiresAt, refresh, ...result } = await this.facade.exchangeToken(dto, meta);

        this.setRefreshCookie(res, refresh, expiresAt);

        return result;
    }

    @Get('providers')
    @GetOAuthProvidersSwagger()
    async getEnabledProviders() {
        return this.facade.getEnabledProviders();
    }

    @Get('providers/connected')
    @GetConnectedProvidersSwagger()
    @UseGuards(BearerAuthGuard)
    async getConnected(@GetUserId() userId: string) {
        return this.facade.getConnectedProviders(userId);
    }

    @Post(':provider/connect')
    @UseGuards(BearerAuthGuard)
    @ConnectOAuthProviderSwagger()
    async connect(@Param('provider') provider: string, @GetUserId() userId: string) {
        return this.facade.connectProvider(provider, userId);
    }

    @Delete(':provider/connect')
    @DisconnectOAuthProviderSwagger()
    @UseGuards(BearerAuthGuard)
    async disconnect(@GetUserId() userId: string, @Param('provider') provider: string) {
        return this.facade.disconnectProvider(provider, userId);
    }

    private setRefreshCookie(res: FastifyReply, refreshToken: string, expires: Date) {
        res.setCookie('refresh', refreshToken, {
            httpOnly: true,
            secure: this.isProduction,
            path: '/',
            expires,
            sameSite: 'lax',
            domain: this.domain ? `.${this.domain}` : undefined,
        });
    }
}
