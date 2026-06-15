import { ConfirmResetPasswordUseCase } from './confirm-reset-password.use-case';
import { AuthenticateOAuthUseCase } from './oauth/authenticate-oauth.use-case';
import { ConnectOAuthProviderUseCase } from './oauth/connect-oauth-provider.use-case';
import { ConnectProviderUseCase } from './oauth/connect-provider.use-case';
import { DisconnectProviderUseCase } from './oauth/disconnect-provider.use-case';
import { GetConnectedProvidersQuery } from './oauth/get-connected-providers.query';
import { GetEnabledProvidersQuery } from './oauth/get-enabled-providers.query';
import { OAuthOrchestratorUseCase } from './oauth/oauth-orchestrator.use-case';
import { ProcessOAuthLoginUseCase } from './oauth/process-oauth-login.use-case';
import { ProcessOAuthRegistrationUseCase } from './oauth/process-oauth-registration.use-case';
import { RefreshTokensUseCase } from './refresh-tokens.use-case';
import { ResendCodeUseCase } from './resend-code.use-case';
import { ResetPasswordUseCase } from './reset-password.use-case';
import { SignInUseCase } from './sign-in.use-case';
import { SignOutUseCase } from './sign-out.use-case';
import { SignUpVerifyUseCase } from './sign-up-verify.use-case';
import { SignUpUseCase } from './sign-up.use-case';
import { VerifyResetPasswordUseCase } from './verify-reset-password.use-case';

export const AuthUseCases = [
    ConfirmResetPasswordUseCase,
    VerifyResetPasswordUseCase,
    GetConnectedProvidersQuery,
    DisconnectProviderUseCase,
    GetEnabledProvidersQuery,
    OAuthOrchestratorUseCase,
    ProcessOAuthLoginUseCase,
    ProcessOAuthRegistrationUseCase,
    ConnectOAuthProviderUseCase,
    AuthenticateOAuthUseCase,
    ConnectProviderUseCase,
    RefreshTokensUseCase,
    ResetPasswordUseCase,
    SignUpVerifyUseCase,
    GetEnabledProvidersQuery,
    SignInUseCase,
    SignOutUseCase,
    SignUpUseCase,
    ResendCodeUseCase,
];

export { ConfirmResetPasswordUseCase } from './confirm-reset-password.use-case';
export { VerifyResetPasswordUseCase } from './verify-reset-password.use-case';
export { GetConnectedProvidersQuery } from './oauth/get-connected-providers.query';
export { DisconnectProviderUseCase } from './oauth/disconnect-provider.use-case';
export { AuthenticateOAuthUseCase } from './oauth/authenticate-oauth.use-case';
export { ConnectProviderUseCase } from './oauth/connect-provider.use-case';
export { RefreshTokensUseCase } from './refresh-tokens.use-case';
export { ResetPasswordUseCase } from './reset-password.use-case';
export { SignUpVerifyUseCase } from './sign-up-verify.use-case';
export { GetEnabledProvidersQuery } from './oauth/get-enabled-providers.query';

export { OAuthOrchestratorUseCase } from './oauth/oauth-orchestrator.use-case';
export { ProcessOAuthLoginUseCase } from './oauth/process-oauth-login.use-case';
export { ProcessOAuthRegistrationUseCase } from './oauth/process-oauth-registration.use-case';
export { ConnectOAuthProviderUseCase } from './oauth/connect-oauth-provider.use-case';
export { SignInUseCase } from './sign-in.use-case';
export { SignOutUseCase } from './sign-out.use-case';
export { SignUpUseCase } from './sign-up.use-case';
export { ResendCodeUseCase } from './resend-code.use-case';
