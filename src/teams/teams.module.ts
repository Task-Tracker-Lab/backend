import { Module } from '@nestjs/common';
import {
    TeamsInvitationsController,
    TeamsMembersController,
    TeamsController,
    MeController,
} from './application/controller';
import { BullModule } from '@nestjs/bullmq';
import { TeamsRepository } from './infrastructure/persistence/repositories';
import { TeamQueues } from './domain/enums';
import { TeamsFacade } from './application/team.facade';
import { TeamQueries, TeamUseCases, TEAM_EXTERNAL_QUERIES } from './application/use-cases';
import { TeamMemberPolicy } from './domain/policy';
import { MailProcessor } from '@core/teams/infrastructure/workers';
import { LISTENERS } from './infrastructure/listeners';

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
    exports: [...TEAM_EXTERNAL_QUERIES],
})
export class TeamsModule {}
