import { IMemberRepository } from '@core/project/domain/repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindProjectMemberQuery {
    constructor(@Inject('IMemberRepository') private readonly memberRepo: IMemberRepository) {}

    execute(projectId: string, memberId: string) {
        return this.memberRepo.findByProjectAndUser(projectId, memberId);
    }
}
