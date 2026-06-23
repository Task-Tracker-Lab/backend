import { Injectable } from '@nestjs/common';
import { CursorQuery } from '@shared/schemas';

import { UpdateProfileDto, UpdateNotificationsDto } from './dtos';
import {
    FindProfileQuery,
    GetActivityQuery,
    UpdateNotificationsUseCase,
    UpdateProfileUseCase,
} from './use-cases';

@Injectable()
export class UserFacade {
    constructor(
        private readonly findProfileQuery: FindProfileQuery,
        private readonly getActivityQuery: GetActivityQuery,
        private readonly updateNotificationsUC: UpdateNotificationsUseCase,
        private readonly updateProfileUC: UpdateProfileUseCase,
    ) {}

    public async getProfile(userId: string) {
        return this.findProfileQuery.execute(userId);
    }

    public async getActivity(userId: string, query: CursorQuery) {
        return this.getActivityQuery.execute(userId, query);
    }

    public async updateProfile(userId: string, dto: UpdateProfileDto) {
        return this.updateProfileUC.execute(userId, dto);
    }

    public async updateNotifications(userId: string, dto: UpdateNotificationsDto) {
        return this.updateNotificationsUC.execute(userId, dto);
    }
}
