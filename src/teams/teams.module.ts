import { MailProcessor } from '@core/teams/infrastructure/workers';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import {
    TeamsInvitationsController,
    TeamsMembersController,
    TeamsController,
    MeController,
} from './application/controller';
import { TeamsFacade } from './application/team.facade';
import {
    TeamQueries,
    TeamUseCases,
    TEAM_EXTERNAL_QUERIES,
    TEAM_EXTERNAL_COMMANDS,
} from './application/use-cases';
import { TeamQueues } from './domain/enums';
import { TeamMemberPolicy } from './domain/policy';
import { LISTENERS } from './infrastructure/listeners';
import { TeamsRepository } from './infrastructure/persistence/repositories';

const REPOSITORY = { provide: 'ITeamsRepository', useClass: TeamsRepository };

@Module({
    imports: [
        BullModule.registerQueue({
            name: TeamQueues.TEAM_MAIL,
        }),
    ],
    controllers: [
        TeamsInvitationsController,
        TeamsMembersController,
        TeamsController,
        MeController,
    ],
    providers: [
        TeamMemberPolicy,
        REPOSITORY,
        ...LISTENERS,
        ...TeamUseCases,
        ...TeamQueries,
        TeamsFacade,
        MailProcessor,
    ],
    exports: [...TEAM_EXTERNAL_QUERIES, ...TEAM_EXTERNAL_COMMANDS],
})
export class TeamsModule {}
