import { AuthController } from './auth/controller';
import { OAuthController } from './oauth/controller';
import { AuthRecoveryController } from './recovery/controller';

export const CONTROLLERS = [OAuthController, AuthRecoveryController, AuthController];
