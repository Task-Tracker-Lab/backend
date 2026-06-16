import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type VerifyCallback, type Profile } from 'passport-google-oauth20';

import { ensureEmail } from '../utils';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google-oauth') {
    constructor(cfg: ConfigService) {
        const isProduction = cfg.get('NODE_ENV') === 'production';
        const domain = cfg.get('DOMAIN');
        const port = cfg.get('PORT');
        const apiPath = 'v1/oauth/google/callback';

        const callbackURL = domain
            ? `${isProduction ? 'https' : 'http'}://api.${domain}/${apiPath}`
            : `http://localhost:${port || 3000}/${apiPath}`;

        super({
            clientID: cfg.getOrThrow('GOOGLE_CLIENT_ID'),
            clientSecret: cfg.getOrThrow('GOOGLE_CLIENT_SECRET'),
            scope: ['email', 'profile'],
            callbackURL,
            passReqToCallback: true,
        });
    }

    validate(_r: never, _at: string, _rt: string, profile: Profile, done: VerifyCallback) {
        const json = profile._json;

        const user = {
            id: profile.id,
            email: ensureEmail(json.email, 'google', profile.id, json.given_name),
            avatar_url: json.picture || null,
            first_name: json.given_name,
            last_name: json.family_name,
            sex: null,
            bio: null,
        };

        done(null, user);
    }
}
