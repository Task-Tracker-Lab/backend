import { TeamFacade } from '@core/team/application/team.facade';
import { Get } from '@nestjs/common';
import { ApiBaseController, GetUser, GetUserId } from '@shared/decorators';

import { FindInvitesSwagger, FindTeamsSwagger } from './swagger';

import type { JwtPayload } from '@shared/types';

@ApiBaseController('users/me', 'Account Teams', true)
export class MeController {
    constructor(private readonly facade: TeamFacade) {}

    @Get('teams')
    @FindTeamsSwagger()
    async findMyTeams(@GetUserId() userId: string) {
        return this.facade.getMyTeams(userId);
    }

    @Get('invites')
    @FindInvitesSwagger()
    async findMyInvites(@GetUser() user: JwtPayload) {
        return this.facade.getMyInvites(user.email);
    }
}
