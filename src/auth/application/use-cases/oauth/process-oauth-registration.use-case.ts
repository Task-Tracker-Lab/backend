import { IIdentityRepository } from '@core/auth/domain/repository';
import { FindUserQuery, RegisterUserUseCase } from '@core/user';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { OAuthResponse } from '../../dtos';
import { BaseException } from '@shared/error';
import { InjectQueue } from '@nestjs/bullmq';
import { AuthQueues, AuthUserJobs } from '@core/auth/domain/enums';
import { Queue } from 'bullmq';
import { CreateUserWorkspaceEvent } from '@core/auth/domain/events';

@Injectable()
export class ProcessOAuthRegistrationUseCase {
    constructor(
        @InjectQueue(AuthQueues.AUTH_USER)
        private readonly queue: Queue,
        @Inject('IIdentityRepository')
        private readonly identityRepo: IIdentityRepository,
        private readonly findUserQ: FindUserQuery,
        private readonly registerUserUC: RegisterUserUseCase,
    ) {}

    async execute(dto: OAuthResponse) {
        const existingUser = await this.findUserByEmail(dto.email);

        if (existingUser) {
            throw new BaseException(
                {
                    code: 'EMAIL_ALREADY_EXISTS',
                    message:
                        'Пользователь с таким email уже существует. Пожалуйста, войдите через пароль.',
                },
                HttpStatus.CONFLICT,
            );
        }

        const user = await this.registerUserUC.execute({
            email: dto.email,
            firstName: dto.first_name || 'User',
            lastName: dto.last_name ?? '',
            password: null,
            bio: dto.bio,
            gender: dto.sex === 'male' ? 'male' : dto.sex === 'female' ? 'female' : 'none',
            avatarUrl: dto.avatar_url,
        });

        await this.identityRepo.create({
            userId: user.id,
            avatarUrl: dto.avatar_url,
            provider: dto.provider as any,
            providerUserId: dto.id,
            email: dto.email,
        });

        const event = new CreateUserWorkspaceEvent(user.id, user.firstName);
        await this.queue.add(AuthUserJobs.CREATE_WORKSPACE, event);

        return { user, isNewUser: true, isConnect: false };
    }

    private async findUserByEmail(email: string) {
        const result = await this.findUserQ.execute({ email });
        return result?.user;
    }
}
