import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { BaseException } from '@shared/error';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface IUserInfo {
    id: string;
    login: string;
    client_id: string;
    display_name: string;
    real_name: string;
    first_name: string;
    last_name: string;
    sex: 'male' | 'female';
    default_email: string;
    emails: string[];
    birthday: string;
    default_avatar_id: string;
    is_avatar_empty: false;
    default_phone: { id: number; number: string };
    psuid: string;
}

export interface IYandexProfile {
    provider: 'yandex';
    id: string;
    displayName: string;
    username: string;
    emails: [{ value: string }];
    name: {
        familyName: string;
        givenName: string;
    };
    gender: 'female' | 'male' | undefined;
    photos: [{ value: string }];
    _raw: string;
    _json: IUserInfo;
    [key: string]: unknown;
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
            clientID: cfg.getOrThrow('YANDEX_CLIENT_ID'),
            clientSecret: cfg.getOrThrow('YANDEX_CLIENT_SECRET'),
            callbackURL,
            scope: ['login:email', 'login:info'],
            passReqToCallback: true,
        });
    }

    async validate(
        _req: never,
        _at: string,
        _rt: string,
        profile: IYandexProfile,
        done: (...args: unknown[]) => void,
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

    private async getUserProfile(accessToken: string): Promise<any> {
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

    userProfile(accessToken: string, done: (err?: Error | null, profile?: any) => void): void {
        this.getUserProfile(accessToken)
            .then((profile) => done(null, profile))
            .catch((err) => done(err, null));
    }
}
