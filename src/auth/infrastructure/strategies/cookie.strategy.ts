import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BaseException } from '@shared/error';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { JwtPayload } from '@shared/types';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class CookieStrategy extends PassportStrategy(Strategy, 'cookie') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: FastifyRequest) => {
                    const token = request?.cookies?.['refresh'];
                    return token ?? null;
                },
            ]),
            secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    validate(_req: FastifyRequest, payload: JwtPayload) {
        if (!payload || !payload.jti) {
            throw new BaseException(
                {
                    code: 'INVALID_REFRESH_TOKEN',
                    message: 'Refresh токен невалиден или протух',
                    details: [{ target: 'auth', reason: 'Payload is missing or jti is invalid' }],
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        return payload;
    }
}
