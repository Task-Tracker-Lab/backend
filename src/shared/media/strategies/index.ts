import { UserAvatarStrategy } from './user-avatar.strategy';
import { TeamMediaStrategy } from './team-media.strategy';

export const MEDIA_STRATEGIES = {
    'user.avatar': new UserAvatarStrategy(),
    'team.avatar': new TeamMediaStrategy(),
    'team.banner': new TeamMediaStrategy(),
} as const;
