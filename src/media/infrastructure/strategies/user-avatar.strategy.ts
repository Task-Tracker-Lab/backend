import { MEDIA_JOBS } from '../../domain/enums/jobs.enum';

// eslint-disable-next-line no-restricted-syntax
import type { UploadMediaDto } from '../../application/dtos';
import type { UpdateMediaUser } from '../interfaces';
import type { MediaDispatchStrategy } from './media.strategy';

export class UserAvatarStrategy implements MediaDispatchStrategy {
    readonly jobName: string = MEDIA_JOBS.UPDATE_USER_AVATAR;

    createPayload(_d: UploadMediaDto, userId: string, path: string): UpdateMediaUser {
        return {
            entity: { type: 'user', id: userId },
            path,
        };
    }
}
