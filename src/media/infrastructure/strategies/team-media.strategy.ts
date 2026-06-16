import { MEDIA_JOBS } from '../../domain/enums/jobs.enum';

// eslint-disable-next-line no-restricted-syntax
import type { UploadMediaDto } from '../../application/dtos';
import type { UpdateMediaTeam } from '../interfaces';
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
