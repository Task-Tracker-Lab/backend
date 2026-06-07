import { BullModule } from '@nestjs/bullmq';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@core/user';
import { CONTROLLERS } from './application/controller';
import { AuthFacade } from './application/auth.facade';
import { AuthUseCases } from './application/use-cases';
import { AuthQueues } from './domain/enums';
import { TokenService } from './infrastructure/security';
import { MailProcessor } from './infrastructure/workers';
import { MailAdapter } from '@shared/adapters/mail';
import { STRATEGIES } from './infrastructure/strategies';
import { REPOSITORIES } from './infrastructure/persistence/repositories';

const WORKERS = [MailProcessor];

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: async (cfg: ConfigService) => ({
                secret: cfg.get('JWT_ACCESS_SECRET'),
                signOptions: {
                    /**
                     * Использование 'any' здесь необходимо, так как Zod гарантирует
                     * формат строки (напр. '15m', '30d') через regex в ConfigSchema, но внутренний тип
                     * 'StringValue' из библиотеки 'ms' слишком строг для обычного string.
                     */
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
        BullModule.registerQueue({
            name: AuthQueues.AUTH_MAIL,
        }),
        forwardRef(() => UserModule),
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
