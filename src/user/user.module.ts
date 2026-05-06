import { Module } from '@nestjs/common';
import { UserRepository } from './infrastructure/persistence/repositories';
import { UserController, UserSettingsController } from './application/controller';
import { UserFacade } from './application/user.facade';
import { USER_EXTERNAL_USE_CASES, UserQueries, UserUseCases } from './application/use-cases';
import { LISTENERS } from './infrastructure/listeners';

const REPOSITORY = {
    provide: 'IUserRepository',
    useClass: UserRepository,
};

@Module({
    imports: [],
    controllers: [UserController, UserSettingsController],
    providers: [REPOSITORY, ...UserUseCases, ...UserQueries, ...LISTENERS, UserFacade],
    exports: [...USER_EXTERNAL_USE_CASES],
})
export class UserModule {}
