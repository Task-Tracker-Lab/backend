import { IUserRepository } from '@core/user/domain/repository';
import { Inject, Injectable } from '@nestjs/common';
import { CursorQuery } from '@shared/schemas';

@Injectable()
export class GetActivityQuery {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
    ) {}

    async execute(id: string, query: CursorQuery) {
        const { items, meta } = await this.userRepo.findActivityByUser(id, {
            limit: Math.min(query.limit, 50),
            cursor: query.cursor,
        });

        return {
            items,
            meta,
        };
    }
}
