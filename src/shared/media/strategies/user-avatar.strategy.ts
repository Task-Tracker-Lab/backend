import type { UploadMediaDto } from '../dtos';
import type { UpdateMediaUser } from '../interfaces/media.interface';
import { MEDIA_JOBS } from '../media.constant';
import { MediaDispatchStrategy } from './media.strategy';

export class UserAvatarStrategy implements MediaDispatchStrategy {
    jobName: string = MEDIA_JOBS.UPDATE_USER_AVATAR;

    createPayload(_d: UploadMediaDto, userId: string, path: string): UpdateMediaUser {
        return {
            entity: { type: 'user', id: userId },
            path,
        };
    }
}
