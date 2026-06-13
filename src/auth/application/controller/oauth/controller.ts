import { Delete, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import {
    DisconnectOAuthProviderSwagger,
    GetConnectedProvidersSwagger,
    ConnectOAuthProviderSwagger,
    GetOAuthProvidersSwagger,
    OAuthCallbackSwagger,
    OAuthLoginSwagger,
} from './swagger';
import type { TOAuthResponse } from '../../dtos';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { BearerAuthGuard, OAuthGuard } from '@shared/guards';
import { AuthFacade } from '../../auth.facade';
import { getDeviceMeta } from '@core/auth/infrastructure/utils';
import { ApiBaseController, GetUserId, SkipContractHandle } from '@shared/decorators';
import { ConfigService } from '@nestjs/config';

@ApiBaseController('auth/oauth', 'OAuth')
export class OAuthController {
    private readonly isProduction: boolean = false;
    private readonly domain: string | null = null;

    constructor(
        private readonly facade: AuthFacade,
        private cfg: ConfigService,
    ) {
        this.isProduction = this.cfg.get('NODE_ENV') === 'production';
        this.domain = this.cfg.get('DOMAIN');
    }

    @Get(':provider')
    @OAuthLoginSwagger()
    @UseGuards(OAuthGuard)
    @SkipContractHandle()
    async oauthLogin() {}

    @Get(':provider/callback')
    @OAuthCallbackSwagger()
    @UseGuards(OAuthGuard)
    @SkipContractHandle()
    async oauthCallback(
        @Query() query: { code?: string; state?: string },
        @Param('provider') provider: 'google' | 'yandex' | 'github' | 'vkontakte',
        @Res({ passthrough: true }) res: FastifyReply,
        @Req() req: FastifyRequest,
    ) {
        const meta = getDeviceMeta(req);
        const body = req.user as unknown as TOAuthResponse;
        const state = query?.state;

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

        const baseUrl = `https://dev.${this.domain}`;

        if (result.isSign) {
            this.setRefreshCookie(res, result.refresh, result.expiresAt);
            res.redirect(`${baseUrl}/oauth?${result.query.toString()}`, 302);
        } else {
            res.redirect(`${baseUrl}/profile?${result.query.toString()}`, 302);
        }
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
