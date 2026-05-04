import { IUserRepository } from '@core/user/domain/repository';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { HttpStatus, Inject, Logger } from '@nestjs/common';
import { BaseException } from '@shared/error';
import { MEDIA_QUEUE, type UpdateMediaUser } from '@shared/media';
import type { Job } from 'bullmq';

@Processor(MEDIA_QUEUE)
export class UpdateAvatarListener extends WorkerHost {
    private readonly logger = new Logger(UpdateAvatarListener.name);

    constructor(
        @Inject('IUserRepository')
        private readonly repository: IUserRepository,
    ) {
        super();
    }

    async process(job: Job<UpdateMediaUser>) {
        if (job.data.entity.type !== 'user') return;

        const { entity, url } = job.data;

        const entityDb = await this.repository.findById(entity.id);

        if (!entityDb) {
            throw new BaseException(
                {
                    code: 'TEAM_NOT_FOUND',
                    message: 'Команда не найдена',
                    details: [{ target: 'slug', value: entity.id }],
                },
                HttpStatus.NOT_FOUND,
            );
        }

        await this.repository.updateAvatar(entityDb.user.id, url);
    }
}
