import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-github';

import { ensureEmail } from '../utils';

interface GitHubJsonProfile {
    readonly login: string;
    readonly id: number;
    readonly avatar_url: string;
    readonly name: string | null;
    readonly email: string | null;
    readonly bio: string | null;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github-oauth') {
    constructor(cfg: ConfigService) {
        const isProduction = cfg.get('NODE_ENV') === 'production';
        const domain = cfg.get('DOMAIN');
        const port = cfg.get('PORT');
        const apiPath = 'v1/oauth/github/callback';

        const callbackURL = domain
            ? `${isProduction ? 'https' : 'http'}://api.${domain}/${apiPath}`
            : `http://localhost:${port || 3000}/${apiPath}`;

        super({
            clientID: cfg.getOrThrow<string>('GITHUB_CLIENT_ID'),
            clientSecret: cfg.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
            callbackURL,
            scope: ['user', 'user:email'],
            passReqToCallback: true,
        });
    }

    validate(
        _r: never,
        _at: string,
        _rt: string,
        profile: Profile,
        done: (...args: readonly unknown[]) => void,
    ) {
        const json = profile._json as unknown as GitHubJsonProfile;

        const user = {
            id: json.id.toString(),
            email: ensureEmail(json.email, 'github', json.id.toString(), json.login),
            first_name: json.name || json.login,
            last_name: null,
            sex: null,
            avatar_url: json.avatar_url || null,
            bio: json.bio || null,
        };

        done(null, user);
    }
}
