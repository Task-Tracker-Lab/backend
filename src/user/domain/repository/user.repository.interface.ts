import type {
    NewUser,
    NewUserActivity,
    User,
    UserActivity,
    UserNotifications,
    UserPreferences,
    UserProfile,
    UserWithSecurity,
} from '../entities';
import type { CursorResult } from '@libs/database';
import type { CursorQuery } from '@shared/schemas';

type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };

export interface IUserRepository {
    create(data: NewUser): Promise<User>;
    findById(id: string): Promise<UserWithSecurity | null>;
    findByIds(ids: string[]): Promise<User[]>;
    findByEmail(email: string): Promise<UserWithSecurity | null>;
    findProfile(id: string): Promise<UserProfile>;
    findActivityByUser(userId: string, options: CursorQuery): Promise<CursorResult<UserActivity>>;
    updateAvatar(id: string, url: string): Promise<boolean>;
    updateProfile(
        id: string,
        data: Partial<User>,
        preferences?: Partial<UserPreferences>,
    ): Promise<boolean>;
    updatePasswordHash(id: string, hash: string): Promise<boolean>;
    updateNotifications(
        id: string,
        settings: DeepPartial<UserNotifications['settings']>,
    ): Promise<boolean>;
    logActivity(data: NewUserActivity): Promise<boolean>;
}
