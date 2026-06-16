import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BaseException } from '@shared/error';
import { Strategy } from 'passport-oauth2';
import { firstValueFrom } from 'rxjs';

import { ensureEmail } from '../utils';

export interface IVKUserInfo {
    readonly id: number;
    readonly first_name: string;
    readonly last_name: string;
    readonly screen_name: string;
    readonly sex: 0 | 1 | 2;
    readonly photo_50?: string;
    readonly photo_100?: string;
    readonly photo_200?: string;
    readonly photo_200_orig?: string;
    readonly photo_400_orig?: string;
    readonly photo_max?: string;
    readonly photo_max_orig?: string;
    readonly city?: { readonly id: number; readonly title: string };
    readonly country?: { readonly id: number; readonly title: string };
    readonly bdate?: string;
    readonly about?: string;
    readonly activities?: string;
    readonly interests?: string;
    readonly music?: string;
    readonly movies?: string;
    readonly tv?: string;
    readonly books?: string;
    readonly games?: string;
    readonly status?: string;
    readonly online?: number;
    readonly domain?: string;
    readonly has_mobile?: number;
    readonly mobile_phone?: string;
    readonly home_phone?: string;
    readonly can_post?: number;
    readonly can_see_all_posts?: number;
    readonly can_see_audio?: number;
    readonly contacts?: {
        readonly mobile_phone?: string;
        readonly home_phone?: string;
    };
    readonly site?: string;
    readonly education?: {
        readonly university?: number;
        readonly university_name?: string;
        readonly faculty?: number;
        readonly faculty_name?: string;
        readonly graduation?: number;
    };
    readonly universities?: ReadonlyArray<{
        readonly id: number;
        readonly name: string;
        readonly faculty: number;
        readonly faculty_name: string;
        readonly graduation: number;
    }>;
}

export interface IVKProfile {
    readonly provider: 'vkontakte';
    readonly id: string;
    readonly displayName: string;
    readonly name: {
        readonly familyName: string;
        readonly givenName: string;
    };
    readonly gender: 'male' | 'female' | undefined;
    readonly emails?: ReadonlyArray<{ readonly value: string }>;
    readonly photos: ReadonlyArray<{ readonly value: string }>;
    readonly city?: string;
    readonly country?: string;
    readonly birthday?: string;
    readonly about?: string;
    readonly _raw: string;
    readonly _json: IVKUserInfo;
    readonly [key: string]: unknown;
}

@Injectable()
export class VkontakteStrategy extends PassportStrategy(Strategy, 'vkontakte-oauth') {
    private readonly apiVersion = '5.199';
    private readonly photoSize = 200;
    private readonly lang = 'ru';

    constructor(
        cfg: ConfigService,
        private readonly http: HttpService,
    ) {
        const isProduction = cfg.get('NODE_ENV') === 'production';
        const domain = cfg.get('DOMAIN');
        const port = cfg.get('PORT');
        const apiPath = 'v1/oauth/yandex/callback';

        const callbackURL = domain
            ? `${isProduction ? 'https' : 'http'}://api.${domain}/${apiPath}`
            : `http://localhost:${port || 3000}/${apiPath}`;

        super({
            authorizationURL: 'https://oauth.vk.com/authorize',
            tokenURL: 'https://oauth.vk.com/access_token',
            clientID: cfg.getOrThrow<string>('VKONTAKTE_CLIENT_ID'),
            clientSecret: cfg.getOrThrow<string>('VKONTAKTE_CLIENT_SECRET'),
            callbackURL,
            scope: ['email', 'photos', 'status', 'wall', 'groups'],
            scopeSeparator: ',',
            passReqToCallback: true,
        });
    }

    validate(
        _req: never,
        _at: never,
        _rt: never,
        profile: IVKProfile,
        done: (...args: readonly unknown[]) => void,
    ) {
        const user = {
            id: profile.id,
            email: ensureEmail(
                profile.emails?.[0]?.value,
                'vkontakte',
                profile.id,
                profile.displayName,
            ),
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
            sex: profile.gender === 'male' ? 'male' : profile.gender === 'female' ? 'female' : null,
            phone: null,
            avatar_url: profile.photos[0]?.value || null,
            bio: profile.about || null,
            city: profile.city || null,
            birthday: profile.birthday || null,
        };

        done(null, user);
    }

    private async getUserProfile(accessToken: string) {
        try {
            const fields = [
                'uid',
                'first_name',
                'last_name',
                'screen_name',
                'sex',
                `photo_${this.photoSize}`,
                'city',
                'country',
                'bdate',
                'about',
                'activities',
                'interests',
                'music',
                'movies',
                'tv',
                'books',
                'games',
                'status',
                'contacts',
                'site',
                'education',
                'universities',
            ];

            const url = `https://api.vk.com/method/users.get`;

            const response = await firstValueFrom(
                this.http.get(url, {
                    params: {
                        fields: fields.join(','),
                        v: this.apiVersion,
                        access_token: accessToken,
                        lang: this.lang,
                        https: 1,
                    },
                }),
            );

            const data = response.data;

            if (data.error) {
                throw new BaseException(
                    {
                        code: 'VK_API_ERROR',
                        message: data.error.error_msg || 'Ошибка VK API',
                        details: [{ error_code: data.error.error_code }],
                    },
                    HttpStatus.BAD_GATEWAY,
                );
            }

            if (!data.response || !data.response[0]) {
                throw new BaseException(
                    {
                        code: 'VK_USER_NOT_FOUND',
                        message: 'Пользователь VK не найден',
                    },
                    HttpStatus.NOT_FOUND,
                );
            }

            return this.parseProfile(data.response[0]);
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            console.error('Failed to get VK user info:', error);

            throw new BaseException(
                {
                    code: 'VK_USER_INFO_FAILED',
                    message: 'Не удалось получить данные пользователя от VK',
                    details: [{ target: error instanceof Error ? error.message : String(error) }],
                },
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    private parseProfile(json: IVKUserInfo): IVKProfile {
        const gender: 'male' | 'female' | undefined = json.sex === 2 ? 'male' : 'female';

        const photoSizes = ['photo_50', 'photo_100', 'photo_200', 'photo_400_orig', 'photo_max'];

        const photos = photoSizes.reduce<{ value: string }[]>((acc, size) => {
            const photoUrl = json[size as keyof IVKUserInfo];
            if (photoUrl && typeof photoUrl === 'string') {
                return [...acc, { value: photoUrl }];
            }
            return acc;
        }, []);

        const finalPhotos =
            photos.length === 0 && json.photo_max ? [...photos, { value: json.photo_max }] : photos;

        const email = json.contacts?.mobile_phone
            ? `${json.contacts.mobile_phone}@vk.phone.internal`
            : undefined;

        const profile: IVKProfile = {
            provider: 'vkontakte',
            id: String(json.id),
            displayName: `${json.first_name} ${json.last_name}`,
            name: {
                familyName: json.last_name || '',
                givenName: json.first_name || '',
            },
            gender,
            emails: email ? [{ value: email }] : [],
            photos: finalPhotos,
            _raw: JSON.stringify(json),
            _json: json,
            ...(json.city?.title && { city: json.city.title }),
            ...(json.country?.title && { country: json.country.title }),
            ...(json.bdate && { birthday: json.bdate }),
            ...(json.about && { about: json.about }),
        };

        return profile;
    }

    override userProfile(
        accessToken: string,
        done: (err?: Error | null, profile?: unknown) => void,
    ): void {
        this.getUserProfile(accessToken)
            .then((profile) => done(null, profile))
            .catch((err) => done(err, null));
    }

    override authorizationParams(
        options: { display?: 'page' | 'popup' | 'mobile' } = {},
    ): Record<string, string> {
        const params: Record<string, string> = {};

        return {
            ...params,
            ...(options.display && { display: options.display }),
        };
    }
}
