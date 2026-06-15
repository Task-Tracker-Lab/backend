import { TeamMediaStrategy } from './team-media.strategy';
import { UserAvatarStrategy } from './user-avatar.strategy';

export const MEDIA_STRATEGIES = {
    'user.avatar': new UserAvatarStrategy(),
    'team.avatar': new TeamMediaStrategy(),
    'team.banner': new TeamMediaStrategy(),
} as const;

export type MediaStrategyKey = keyof typeof MEDIA_STRATEGIES;
