import { IUserRepository } from '@core/user/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindByIdsQuery {
    constructor(@Inject('IUserRepository') private readonly userRepo: IUserRepository) {}

    async execute(ids: string[]) {
        return this.userRepo.findByIds(ids);
    }
}
