import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import type { JwtPayload } from '@shared/types';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, 'bearer') {
    constructor(cfg: ConfigService) {
        const audience = cfg.getOrThrow('JWT_AUDIENCE');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: cfg.getOrThrow('JWT_ACCESS_SECRET'),
            issuer: cfg.getOrThrow('JWT_ISSUER'),
            audience,
        });
    }

    validate(payload: JwtPayload) {
        return payload;
    }
}
