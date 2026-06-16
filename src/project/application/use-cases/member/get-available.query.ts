import { Injectable } from '@nestjs/common';

@Injectable()
export class GetAvailableTeamMemberQuery {
    constructor() {}

    async execute(slug: string, userId: string, search?: string) {
        return {
            success: true,
            message: '',
            slug,
            userId,
            search,
        };
    }
}
