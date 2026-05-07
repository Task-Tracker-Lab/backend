import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from '@shared/types';
import type { User } from '@core/user';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly cfg: ConfigService,
    ) {}

    async generateTokens(user: User, sessionId: string) {
        const domain = this.cfg.get('DOMAIN');
        const audConstraint = this.cfg.getOrThrow('JWT_AUDIENCE');

        const payload = {
            jti: sessionId,
            sub: user.id,
            email: user.email,
            iss: btoa(domain),
            aud: btoa(audConstraint),
        };

        const accessExp = this.cfg.get<any>('JWT_ACCESS_EXPIRES_IN');
        const refreshExp = this.cfg.get<any>('JWT_REFRESH_EXPIRES_IN');

        const [access, refresh] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.cfg.get('JWT_ACCESS_SECRET'),
                expiresIn: accessExp,
            }),
            this.jwtService.signAsync(payload, {
                secret: this.cfg.get('JWT_REFRESH_SECRET'),
                expiresIn: refreshExp,
            }),
        ]);

        const refreshDecodedData = this.jwtService.decode(refresh);

        return { access, refresh, expiresAt: new Date(refreshDecodedData?.exp * 1000) };
    }

    async validateToken(token: string, type: 'access' | 'refresh'): Promise<JwtPayload> {
        try {
            const accessSecret = this.cfg.get('JWT_ACCESS_SECRET');
            const refreshSecret = this.cfg.get('JWT_REFRESH_SECRET');

            const secret = type === 'access' ? accessSecret : refreshSecret;

            return this.jwtService.verifyAsync(token, { secret });
        } catch (e) {
            return null;
        }
    }
}
