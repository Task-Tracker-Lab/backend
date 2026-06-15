import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { BaseException } from '@shared/error';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface IVKUserInfo {
    id: number;
    first_name: string;
    last_name: string;
    screen_name: string;
    sex: 0 | 1 | 2;
    photo_50?: string;
    photo_100?: string;
    photo_200?: string;
    photo_200_orig?: string;
    photo_400_orig?: string;
    photo_max?: string;
    photo_max_orig?: string;
    city?: { id: number; title: string };
    country?: { id: number; title: string };
    bdate?: string;
    about?: string;
    activities?: string;
    interests?: string;
    music?: string;
    movies?: string;
    tv?: string;
    books?: string;
    games?: string;
    status?: string;
    online?: number;
    domain?: string;
    has_mobile?: number;
    mobile_phone?: string;
    home_phone?: string;
    can_post?: number;
    can_see_all_posts?: number;
    can_see_audio?: number;
    contacts?: {
        mobile_phone?: string;
        home_phone?: string;
    };
    site?: string;
    education?: {
        university?: number;
        university_name?: string;
        faculty?: number;
        faculty_name?: string;
        graduation?: number;
    };
    universities?: Array<{
        id: number;
        name: string;
        faculty: number;
        faculty_name: string;
        graduation: number;
    }>;
}

export interface IVKProfile {
    provider: 'vkontakte';
    id: string;
    displayName: string;
    name: {
        familyName: string;
        givenName: string;
    };
    gender: 'male' | 'female' | undefined;
    emails?: Array<{ value: string }>;
    photos: Array<{ value: string }>;
    city?: string;
    country?: string;
    birthday?: string;
    about?: string;
    _raw: string;
    _json: IVKUserInfo;
    [key: string]: unknown;
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
        const apiPath = 'v1/auth/oauth/yandex/callback';

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

    async validate(
        _req: never,
        _at: never,
        _rt: never,
        profile: IVKProfile,
        done: (...args: unknown[]) => void,
    ) {
        const user = {
            id: profile.id,
            email: `${profile.displayName}@vk.placholder.internal`,
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

    private async getUserProfile(accessToken: string): Promise<any> {
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
            if (error instanceof BaseException) throw error;

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
        let gender: 'male' | 'female' | undefined;
        if (json.sex === 2) gender = 'male';
        else if (json.sex === 1) gender = 'female';

        const photos: Array<{ value: string }> = [];
        const photoSizes = ['photo_50', 'photo_100', 'photo_200', 'photo_400_orig', 'photo_max'];

        for (const size of photoSizes) {
            const photoUrl = json[size as keyof IVKUserInfo];
            if (photoUrl && typeof photoUrl === 'string') {
                photos.push({ value: photoUrl });
            }
        }

        if (photos.length === 0 && json.photo_max) {
            photos.push({ value: json.photo_max });
        }

        const profile: IVKProfile = {
            provider: 'vkontakte',
            id: String(json.id),
            displayName: `${json.first_name} ${json.last_name}`,
            name: {
                familyName: json.last_name || '',
                givenName: json.first_name || '',
            },
            gender: gender,
            emails: [],
            photos: photos,
            _raw: JSON.stringify(json),
            _json: json,
        };

        if (json.city && json.city.title) {
            profile.city = json.city.title;
        }

        if (json.country && json.country.title) {
            profile.country = json.country.title;
        }

        if (json.bdate) {
            profile.birthday = json.bdate;
        }

        if (json.about) {
            profile.about = json.about;
        }

        return profile;
    }

    override userProfile(
        accessToken: string,
        done: (err?: Error | null, profile?: any) => void,
    ): void {
        this.getUserProfile(accessToken)
            .then((profile) => done(null, profile))
            .catch((err) => done(err, null));
    }

    override authorizationParams(
        options: { display?: 'page' | 'popup' | 'mobile' } = {},
    ): Record<string, string> {
        const params: Record<string, string> = {};

        if (options.display) {
            params['display'] = options.display;
        }

        return params;
    }
}
