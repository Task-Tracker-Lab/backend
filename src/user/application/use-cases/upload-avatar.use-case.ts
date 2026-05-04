import { IUserRepository } from '@core/user/domain/repository';
import { Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

@Injectable()
export class UploadAvatarUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
    ) {}

    async execute(userId: string) {
        // const result = await this.mediaService.uploadUserAvatar(userId, fileDto);

        // const [sm, md, lg] = await Promise.all([
        //     this.imagor.get(result, 'small'),
        //     this.imagor.get(result, 'medium'),
        //     this.imagor.get(result, 'large'),
        // ]);

        const result = '';
        await this.userRepo.updateAvatar(userId, result);

        await this.userRepo.logActivity({
            id: createId(),
            userId,
            eventType: 'AVATAR_CHANGED',
            metadata: {
                url: result,
            },
        });

        return {
            success: true,
        };
    }
}
