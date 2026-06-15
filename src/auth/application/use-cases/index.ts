import { ConfirmResetPasswordUseCase } from './confirm-reset-password.use-case';
import { AuthenticateOAuthUseCase } from './oauth/authenticate-oauth.use-case';
import { ConnectOAuthProviderUseCase } from './oauth/connect-oauth-provider.use-case';
import { ConnectProviderUseCase } from './oauth/connect-provider.use-case';
import { DisconnectProviderUseCase } from './oauth/disconnect-provider.use-case';
import { ExchangeUseCase } from './oauth/exchange.use-case';
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
    ExchangeUseCase,
];

export * from './confirm-reset-password.use-case';
export * from './verify-reset-password.use-case';
export * from './oauth/get-connected-providers.query';
export * from './oauth/disconnect-provider.use-case';
export * from './oauth/authenticate-oauth.use-case';
export * from './oauth/connect-provider.use-case';
export * from './refresh-tokens.use-case';
export * from './reset-password.use-case';
export * from './sign-up-verify.use-case';
export * from './oauth/get-enabled-providers.query';
export * from './oauth/exchange.use-case';

export * from './oauth/oauth-orchestrator.use-case';
export * from './oauth/process-oauth-login.use-case';
export * from './oauth/process-oauth-registration.use-case';
export * from './oauth/connect-oauth-provider.use-case';
export * from './sign-in.use-case';
export * from './sign-out.use-case';
export * from './sign-up.use-case';
export * from './resend-code.use-case';
