import { IUserRepository } from '@core/user/domain/repository';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseException } from '@shared/error';
import { ImageHelper } from '@shared/utils';

@Injectable()
export class FindProfileQuery {
    private readonly logger = new Logger('TEST');
    constructor(
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
        private readonly cfg: ConfigService,
    ) {}

    async execute(userId: string) {
        const { user, notifications, security } = await this.userRepo.findProfile(userId);

        if (!user) {
            throw new BaseException(
                { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' },
                HttpStatus.NOT_FOUND,
            );
        }
        const { id, email, avatarUrl, ...profile } = user;
        this.logger.debug(user);
        const cdn = this.getCdnBaseUrl();

        const avatar = ImageHelper.buildResponsiveUrls(cdn, avatarUrl);

        return {
            id,
            email,
            profile: {
                ...profile,
                avatar,
            },
            security,
            notifications,
        };
    }

    private getCdnBaseUrl(): string {
        const domain = this.cfg.get<string>('DOMAIN');
        const bucket = this.cfg.get<string>('S3_BUCKET_NAME');
        const endpoint = this.cfg.get<string>('S3_ENDPOINT');

        return domain ? `https://cdn.${domain}/${bucket}` : `${endpoint}/${bucket}`;
    }
}
