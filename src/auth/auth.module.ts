import { TeamQueues } from '@core/team/domain/enums';
import { UserModule } from '@core/user';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailAdapter } from '@shared/adapters/mail';

import { AuthFacade } from './application/auth.facade';
import { CONTROLLERS } from './application/controllers';
import { AuthUseCases } from './application/use-cases';
import { AuthQueues } from './domain/enums';
import { REPOSITORIES } from './infrastructure/persistence/repositories';
import { TokenService } from './infrastructure/security';
import { STRATEGIES } from './infrastructure/strategies';
import { MailProcessor, UserProcessor } from './infrastructure/workers';

const WORKERS = [MailProcessor, UserProcessor];

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                secret: cfg.get('JWT_ACCESS_SECRET'),
                signOptions: {
                    /**
                     * Использование 'any' здесь необходимо, так как Zod гарантирует
                     * формат строки (напр. '15m', '30d') через regex в ConfigSchema, но внутренний тип
                     * 'StringValue' из библиотеки 'ms' слишком строг для обычного string.
                     */
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    expiresIn: cfg.get<any>('JWT_ACCESS_EXPIRES_IN'),
                    algorithm: 'HS256',
                },
                verifyOptions: {
                    algorithms: ['HS256'],
                    ignoreExpiration: false,
                    clockTolerance: 10,
                },
            }),
        }),
        BullModule.registerQueue(
            { name: AuthQueues.AUTH_MAIL },
            { name: AuthQueues.AUTH_USER },
            { name: TeamQueues.TEAM_WORKSPACE },
        ),
        UserModule,
    ],
    controllers: CONTROLLERS,
    providers: [
        // TOOD: FIX PROVIDER
        {
            provide: 'IMailPort',
            useClass: MailAdapter,
        },
        ...WORKERS,
        TokenService,
        ...AuthUseCases,
        ...STRATEGIES,
        ...REPOSITORIES,
        AuthFacade,
    ],
    exports: [],
})
export class AuthModule {}
