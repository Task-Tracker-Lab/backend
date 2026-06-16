import { IUserRepository } from '@core/user/domain/repository';
import { Inject, Injectable } from '@nestjs/common';
import { PaginationQuery } from '@shared/schemas';

@Injectable()
export class GetActivityQuery {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepo: IUserRepository,
    ) {}

    async execute(id: string, query: PaginationQuery) {
        const { limit, page } = query;

        const safeLimit = Math.min(limit, 50);
        const offset = (page - 1) * safeLimit;

        const { items, total } = await this.userRepo.findActivityByUser(id, {
            limit: safeLimit,
            offset,
        });

        const totalPages = Math.ceil(total / safeLimit);

        return {
            // TODO: реализовать полноценную пагинацию по общей схеме (hasNextPage/hasPrevPage) везде.
            items,
            meta: {
                total,
                page,
                limit: safeLimit,
                totalPages,
                hasPrevPage: page > 1,
                hasNextPage: totalPages > 0 && page < totalPages,
            },
        };
    }
}
