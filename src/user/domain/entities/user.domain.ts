import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type {
    users,
    userSecurity,
    userNotifications,
    userActivity,
    userPreferences,
} from '../../infrastructure/persistence/models/user.entity';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type UserPreferences = InferSelectModel<typeof userPreferences>;
export type NewUserPreferences = InferInsertModel<typeof userPreferences>;

export type UserSecurity = InferSelectModel<typeof userSecurity>;
export type NewUserSecurity = InferInsertModel<typeof userSecurity>;

export type UserNotifications = InferSelectModel<typeof userNotifications>;
export type NotificationSettings = NonNullable<UserNotifications['settings']>;

export type UserActivity = InferSelectModel<typeof userActivity>;
export type NewUserActivity = InferInsertModel<typeof userActivity>;

export type UserProfile = {
    readonly user: User;
    readonly security: {
        readonly lastPasswordChange: string | null;
        readonly is2faEnabled: boolean;
    };
    readonly preferences: UserPreferences | null;
    readonly notifications: NotificationSettings;
};

export type UserWithSecurity = {
    readonly user: User;
    readonly security: {
        readonly passwordHash: string | null;
    };
};
