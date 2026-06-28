import { IUserRepository } from '@core/user/domain/repository';
import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { BaseException } from '@shared/error';
import { removeUndefined } from '@shared/utils';

import { UserErrorCodes, UserErrorMessages } from '../../domain/errors';
import { UpdateProfileDto } from '../dtos';

@Injectable()
export class UpdateProfileUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
    ) {}

    async execute(id: string, dto: UpdateProfileDto) {
        const entity = await this.userRepo.findById(id);

        if (!entity?.user) {
            throw new BaseException(
                {
                    code: UserErrorCodes.NOT_FOUND,
                    message: UserErrorMessages[UserErrorCodes.NOT_FOUND],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        this.validatePronouns(dto);

        const { timezone, theme, language, ...profile } = dto;

        const preferences = {
            timezone,
            language,
            theme,
        };

        try {
            const result = await this.userRepo.updateProfile(
                entity.user.id,
                removeUndefined(profile),
                removeUndefined(preferences),
            );

            await this.userRepo.logActivity({
                id: createId(),
                userId: id,
                eventType: 'PROFILE_UPDATED',
            });

            return { success: result, message: 'Профиль успешно обновлен' };
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

    private validatePronouns(dto: UpdateProfileDto) {
        if (dto.pronouns === 'other' && (!dto.pronounsCustom || dto.pronounsCustom.trim() === '')) {
            throw new BaseException(
                {
                    code: UserErrorCodes.PRONOUNS_CUSTOM_REQUIRED,
                    message: UserErrorMessages[UserErrorCodes.PRONOUNS_CUSTOM_REQUIRED],
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        if (dto.pronounsCustom && dto.pronounsCustom.length > 50) {
            throw new BaseException(
                {
                    code: UserErrorCodes.PRONOUNS_CUSTOM_TOO_LONG,
                    message: UserErrorMessages[UserErrorCodes.PRONOUNS_CUSTOM_TOO_LONG],
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
