import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import {
    TeamInvitationsController,
    TeamMembersController,
    TeamController,
    MeController,
} from './application/controllers';
import { TeamFacade } from './application/team.facade';
import {
    TeamQueries,
    TeamUseCases,
    TEAM_EXTERNAL_QUERIES,
    TEAM_EXTERNAL_COMMANDS,
} from './application/use-cases';
import { TeamQueues } from './domain/enums';
import { TeamMemberPolicy } from './domain/policy';
import { LISTENERS } from './infrastructure/listeners';
import { TeamRepository } from './infrastructure/persistence/repositories';
import { MailProcessor } from './infrastructure/workers';

const REPOSITORY = { provide: 'ITeamRepository', useClass: TeamRepository };

@Module({
    imports: [
        BullModule.registerQueue({
            name: TeamQueues.TEAM_MAIL,
        }),
    ],
    controllers: [TeamInvitationsController, TeamMembersController, TeamController, MeController],
    providers: [
        TeamMemberPolicy,
        REPOSITORY,
        ...LISTENERS,
        ...TeamUseCases,
        ...TeamQueries,
        TeamFacade,
        MailProcessor,
    ],
    exports: [...TEAM_EXTERNAL_QUERIES, ...TEAM_EXTERNAL_COMMANDS],
})
export class TeamModule {}
