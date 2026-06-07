import { OAuthAssets } from '@core/auth/infrastructure/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetEnabledProvidersQuery {
    constructor(private readonly cfg: ConfigService) {}

    async execute() {
        const providers = [];

        if (this.cfg.get('GOOGLE_CLIENT_ID') && this.cfg.get('GOOGLE_CLIENT_SECRET')) {
            providers.push(OAuthAssets.google);
        }

        if (this.cfg.get('GITHUB_CLIENT_ID') && this.cfg.get('GITHUB_CLIENT_SECRET')) {
            providers.push(OAuthAssets.github);
        }

        if (this.cfg.get('YANDEX_CLIENT_ID') && this.cfg.get('YANDEX_CLIENT_SECRET')) {
            providers.push(OAuthAssets.yandex);
        }

        if (this.cfg.get('VKONTAKTE_CLIENT_ID') && this.cfg.get('VKONTAKTE_CLIENT_SECRET')) {
            providers.push(OAuthAssets.yandex);
        }

        return providers;
    }
}
