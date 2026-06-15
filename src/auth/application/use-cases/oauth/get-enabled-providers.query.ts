import { OAuthAssets } from '@core/auth/infrastructure/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetEnabledProvidersQuery {
    constructor(private readonly cfg: ConfigService) {}

    async execute() {
        return [
            ...(this.cfg.get('GOOGLE_CLIENT_ID') && this.cfg.get('GOOGLE_CLIENT_SECRET')
                ? [OAuthAssets.google]
                : []),
            ...(this.cfg.get('GITHUB_CLIENT_ID') && this.cfg.get('GITHUB_CLIENT_SECRET')
                ? [OAuthAssets.github]
                : []),
            ...(this.cfg.get('YANDEX_CLIENT_ID') && this.cfg.get('YANDEX_CLIENT_SECRET')
                ? [OAuthAssets.yandex]
                : []),
            ...(this.cfg.get('VKONTAKTE_CLIENT_ID') && this.cfg.get('VKONTAKTE_CLIENT_SECRET')
                ? [OAuthAssets.vkontakte]
                : []),
        ];
    }
}
