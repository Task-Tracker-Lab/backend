import { Body, Param, Put } from '@nestjs/common';
import { ApiBaseController } from '@shared/decorators';
import { SyncTeamTagsSwagger } from './swagger';
import { SyncTagsDto } from '../../dtos';
import { TeamsFacade } from '../../team.facade';

@ApiBaseController('teams/:slug', 'Teams Settings', true)
export class TeamsSettingsController {
    constructor(private readonly facade: TeamsFacade) {}

    @Put('tags')
    @SyncTeamTagsSwagger()
    async syncTags(@Param('slug') slug: string, @Body() dto: SyncTagsDto) {
        return this.facade.syncTags(slug, dto.tags);
    }
}
