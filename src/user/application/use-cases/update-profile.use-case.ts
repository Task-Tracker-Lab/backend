import { IUserRepository } from '@core/user/domain/repository';
import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { UpdateProfileDto } from '../dtos';
import { BaseException } from '@shared/error';
import { createId } from '@paralleldrive/cuid2';

@Injectable()
export class UpdateProfileUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
    ) {}

    async execute(id: string, dto: UpdateProfileDto) {
        const entity = await this.userRepo.findById(id);

        if (!entity.user) {
            throw new BaseException(
                { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' },
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

        const isUpdated = await this.userRepo.updateProfile(entity.user.id, profile, preferences);

        if (!isUpdated) {
            throw new BaseException(
                { code: 'PROFILE_UPDATE_FAILED', message: 'Не удалось обновить данные' },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        await this.userRepo.logActivity({
            id: createId(),
            userId: id,
            eventType: 'PROFILE_UPDATED',
        });

        return { success: true, message: 'Профиль успешно обновлен' };
    }

    private validatePronouns(dto: UpdateProfileDto) {
        if (dto.pronouns === 'other' && (!dto.pronounsCustom || dto.pronounsCustom.trim() === '')) {
            throw new BaseException(
                {
                    code: 'PRONOUNS_CUSTOM_REQUIRED',
                    message: 'Пожалуйста, укажите пользовательские местоимения',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        if (dto.pronounsCustom && dto.pronounsCustom.length > 50) {
            throw new BaseException(
                {
                    code: 'PRONOUNS_CUSTOM_TOO_LONG',
                    message: 'Пользовательские местоимения не могут превышать 50 символов',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
