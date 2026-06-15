// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { UploadMediaDto } from '../dtos';
import type { UpdateMediaTeam } from '../interfaces/media.interface';
import { MEDIA_JOBS } from '../media.constant';
import type { MediaDispatchStrategy } from './media.strategy';

export class TeamMediaStrategy implements MediaDispatchStrategy {
    readonly jobName: string = MEDIA_JOBS.UPDATE_TEAM_MEDIA;

    createPayload(dto: UploadMediaDto, userId: string, path: string): UpdateMediaTeam {
        const type = dto.context.split('.').pop();
        if (type !== 'avatar' && type !== 'banner') {
            throw new Error(`Invalid media type: ${type}`);
        }

        return {
            entity: { type: 'team', id: dto.teamId! },
            initiatorId: userId,
            type,
            path,
        };
    }
}
