import type { UploadMediaDto } from '../dtos';
import type { UpdateMediaTeam } from '../interfaces/media.interface';
import { MEDIA_JOBS } from '../media.constant';
import { MediaDispatchStrategy } from './media.strategy';

export class TeamMediaStrategy implements MediaDispatchStrategy {
    jobName: string = MEDIA_JOBS.UPDATE_TEAM_MEDIA;

    createPayload(dto: UploadMediaDto, userId: string, path: string): UpdateMediaTeam {
        return {
            entity: { type: 'team', id: dto.teamId! },
            type: dto.context.split('.').pop() as 'avatar' | 'banner',
            initiatorId: userId,
            path,
        };
    }
}
