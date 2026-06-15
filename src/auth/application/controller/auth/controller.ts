import { Body, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
    PostLoginSwagger,
    PostLogoutSwagger,
    PostRefreshSwagger,
    PostRegisterSwagger,
    PostSignUpConfirmSwagger,
    ResendCodeSwagger,
} from './swagger';
import { ResendCodeDto, SignInDto, SignUpDto, VerifyDto } from '../../dtos';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { BearerAuthGuard, CookieAuthGuard } from '@shared/guards';
import { AuthFacade } from '../../auth.facade';
import { getDeviceMeta } from '@core/auth/infrastructure/utils';
import { ApiBaseController } from '@shared/decorators';
import { ConfigService } from '@nestjs/config';

@ApiBaseController('auth', 'Auth')
export class AuthController {
    private readonly isProduction: boolean = false;
    private readonly domain?: string | null = null;

    constructor(
        private readonly facade: AuthFacade,
        private readonly cfg: ConfigService,
    ) {
        this.isProduction = this.cfg.get('NODE_ENV') === 'production';
        this.domain = this.cfg.get('DOMAIN');
    }

    @Post('sign-up')
    @PostRegisterSwagger()
    @HttpCode(202)
    async signUp(@Body() dto: SignUpDto) {
        return this.facade.signUp(dto);
    }

    @Post('resend')
    @ResendCodeSwagger()
    @HttpCode(200)
    async resendCode(@Body() dto: ResendCodeDto) {
        return this.facade.resendCode(dto);
    }

    @Post('sign-up/confirm')
    @PostSignUpConfirmSwagger()
    @HttpCode(201)
    async verifySignUp(
        @Res({ passthrough: true }) res: FastifyReply,
        @Req() req: FastifyRequest,
        @Body() dto: VerifyDto,
    ) {
        const meta = getDeviceMeta(req);
        const { tokens, expiresAt, ...response } = await this.facade.verifySignUp(dto, meta);

        this.setRefreshCookie(res, tokens.refresh, expiresAt);

        return { ...response, token: tokens.access };
    }

    @Post('sign-in')
    @PostLoginSwagger()
    async signIn(
        @Res({ passthrough: true }) res: FastifyReply,
        @Req() req: FastifyRequest,
        @Body() dto: SignInDto,
    ) {
        const meta = getDeviceMeta(req);
        const { tokens, expiresAt, ...response } = await this.facade.signIn(dto, meta);

        this.setRefreshCookie(res, tokens.refresh, expiresAt);

        return { ...response, token: tokens.access };
    }

    @Post('sign-out')
    @HttpCode(HttpStatus.OK)
    @UseGuards(BearerAuthGuard)
    @PostLogoutSwagger()
    async logout(@Res({ passthrough: true }) res: FastifyReply, @Req() req: FastifyRequest) {
        const session = req.cookies?.['refresh'];

        const response = await this.facade.signOut(session);

        res.clearCookie('refresh', {
            path: '/',
            domain: this.domain ? `.${this.domain}` : undefined,
        });

        return response;
    }

    @Post('refresh')
    @UseGuards(CookieAuthGuard)
    @PostRefreshSwagger()
    @HttpCode(200)
    async refresh(@Res({ passthrough: true }) res: FastifyReply, @Req() req: FastifyRequest) {
        const meta = getDeviceMeta(req);
        const session = req.cookies?.['refresh'];
        const { tokens, expiresAt, ...response } = await this.facade.refreshTokens(session, meta);

        this.setRefreshCookie(res, tokens.refresh, expiresAt);

        return { token: tokens.access, ...response };
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
