import { IUserRepository } from '@core/user/domain/repository';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { BaseException } from '@shared/error';
import { removeUndefined } from '@shared/utils';

import { UserErrorCodes, UserErrorMessages } from '../../domain/errors';
import { UpdateNotificationsDto } from '../dtos';

@Injectable()
export class UpdateNotificationsUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
    ) {}

    async execute(id: string, dto: UpdateNotificationsDto) {
        const user = await this.userRepo.findById(id);

        if (!user) {
            throw new BaseException(
                {
                    code: UserErrorCodes.NOT_FOUND,
                    message: UserErrorMessages[UserErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        try {
            const result = await this.userRepo.updateNotifications(
                id,
                removeUndefined({
                    email: dto.email,
                    push: dto.push,
                }),
            );

            await this.userRepo.logActivity({
                id: createId(),
                userId: id,
                eventType: 'NOTIFICATIONS_UPDATED',
            });

            return {
                success: result,
                message: 'Настройки уведомлений обновлены',
            };
        } catch (error) {
            if (error instanceof BaseException) {
                throw error;
            }

            throw new BaseException(
                {
                    code: UserErrorCodes.UPDATE_FAILED,
                    message: UserErrorMessages[UserErrorCodes.UPDATE_FAILED],
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
