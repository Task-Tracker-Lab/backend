import { ProjectQueues } from '@core/project/domain/enums';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import {
    TeamInvitationsController,
    TeamMembersController,
    TeamController,
    MeController,
} from './application/controllers';
import { TeamFacade } from './application/team.facade';
import { TeamQueries, TeamUseCases, TEAM_EXTERNAL_QUERIES } from './application/use-cases';
import { TeamQueues } from './domain/enums';
import { TeamMemberPolicy } from './domain/policy';
import { LISTENERS } from './infrastructure/listeners';
import { TeamRepository } from './infrastructure/persistence/repositories';
import { MailProcessor, TeamProcessor } from './infrastructure/workers';

const REPOSITORY = { provide: 'ITeamRepository', useClass: TeamRepository };

@Module({
    imports: [
        BullModule.registerQueue(
            { name: TeamQueues.TEAM_MAIL },
            { name: TeamQueues.TEAM_WORKSPACE },
            { name: ProjectQueues.PROJECT_WORKSPACE },
        ),
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
        TeamProcessor,
    ],
    exports: [...TEAM_EXTERNAL_QUERIES],
})
export class TeamModule {}
