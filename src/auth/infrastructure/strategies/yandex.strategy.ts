import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BaseException } from '@shared/error';
import { Strategy } from 'passport-oauth2';
import { firstValueFrom } from 'rxjs';

export interface IUserInfo {
    readonly id: string;
    readonly login: string;
    readonly client_id: string;
    readonly display_name: string;
    readonly real_name: string;
    readonly first_name: string;
    readonly last_name: string;
    readonly sex: 'male' | 'female';
    readonly default_email: string;
    readonly emails: readonly string[];
    readonly birthday: string;
    readonly default_avatar_id: string;
    readonly is_avatar_empty: false;
    readonly default_phone: { readonly id: number; readonly number: string };
    readonly psuid: string;
}

export interface IYandexProfile {
    readonly provider: 'yandex';
    readonly id: string;
    readonly displayName: string;
    readonly username: string;
    readonly emails: readonly [{ readonly value: string }];
    readonly name: {
        readonly familyName: string;
        readonly givenName: string;
    };
    readonly gender: 'female' | 'male' | undefined;
    readonly photos: readonly [{ readonly value: string }];
    readonly _raw: string;
    readonly _json: IUserInfo;
    readonly [key: string]: unknown;
}

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex-oauth') {
    constructor(
        cfg: ConfigService,
        private readonly http: HttpService,
    ) {
        const isProduction = cfg.get('NODE_ENV') === 'production';
        const domain = cfg.get('DOMAIN');
        const port = cfg.get('PORT');
        const apiPath = 'v1/auth/oauth/yandex/callback';

        const callbackURL = domain
            ? `${isProduction ? 'https' : 'http'}://api.${domain}/${apiPath}`
            : `http://localhost:${port || 3000}/${apiPath}`;

        super({
            authorizationURL: 'https://oauth.yandex.ru/authorize',
            tokenURL: 'https://oauth.yandex.ru/token',
            clientID: cfg.getOrThrow<string>('YANDEX_CLIENT_ID'),
            clientSecret: cfg.getOrThrow<string>('YANDEX_CLIENT_SECRET'),
            callbackURL,
            scope: ['login:email', 'login:info'],
            passReqToCallback: true,
        });
    }

    validate(
        _req: never,
        _at: string,
        _rt: string,
        profile: IYandexProfile,
        done: (...args: readonly unknown[]) => void,
    ) {
        const json = profile._json;

        const user = {
            id: json.id,
            email: json.default_email,
            first_name: json.first_name,
            last_name: json.last_name,
            sex: json.sex || null,
            phone: json.default_phone.number,
            avatar_url: profile.photos?.[0]?.value || null,
            bio: null,
        };

        done(null, user);
    }

    private async getUserProfile(accessToken: string) {
        try {
            const response = await firstValueFrom(
                this.http.get<IUserInfo>('https://login.yandex.ru/info', {
                    headers: {
                        Authorization: `OAuth ${accessToken}`,
                    },
                    params: {
                        format: 'json',
                    },
                }),
            );

            const data = response.data;

            return {
                provider: 'yandex',
                id: String(data.id),
                displayName: data.display_name || data.real_name || data.login,
                username: data.login,
                emails: [{ value: data.default_email }],
                name: {
                    familyName: data.last_name || '',
                    givenName: data.first_name || '',
                },
                gender: data.sex === 'male' ? 'male' : data.sex === 'female' ? 'female' : undefined,
                photos: data.default_avatar_id
                    ? [
                          {
                              value: `https://avatars.yandex.net/get-yapic/${data.default_avatar_id}/islands-200`,
                          },
                      ]
                    : [],
                _raw: JSON.stringify(data),
                _json: data,
            };
        } catch (error) {
            console.error('Failed to get Yandex user info:', error);

            throw new BaseException(
                {
                    code: 'YANDEX_USER_INFO_FAILED',
                    message: 'Не удалось получить данные пользователя от Яндекса',
                    details: [{ target: error instanceof Error ? error.message : String(error) }],
                },
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    override userProfile(
        accessToken: string,
        done: (err?: Error | null, profile?: unknown) => void,
    ): void {
        this.getUserProfile(accessToken)
            .then((profile) => done(null, profile))
            .catch((err) => done(err, null));
    }
}
