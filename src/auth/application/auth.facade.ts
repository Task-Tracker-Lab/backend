import { Injectable } from '@nestjs/common';
import {
    SignInUseCase,
    SignUpUseCase,
    SignOutUseCase,
    SignUpVerifyUseCase,
    RefreshTokensUseCase,
    ResetPasswordUseCase,
    VerifyResetPasswordUseCase,
    ConfirmResetPasswordUseCase,
    AuthenticateOAuthUseCase,
    ConnectProviderUseCase,
    DisconnectProviderUseCase,
    GetConnectedProvidersQuery,
    GetEnabledProvidersQuery,
    ResendCodeUseCase,
} from './use-cases';
import {
    OAuthResponse,
    PasswordResetConfirmDto,
    ResendCodeDto,
    ResetPasswordDto,
    SignInDto,
    SignUpDto,
    VerifyDto,
    VerifyResetCodeDto,
} from './dtos';
import type { DeviceMetadata } from '../infrastructure/utils';

@Injectable()
export class AuthFacade {
    constructor(
        private readonly signInUseCase: SignInUseCase,
        private readonly signUpUseCase: SignUpUseCase,
        private readonly signOutUseCase: SignOutUseCase,
        private readonly getEnabledProvidersQuery: GetEnabledProvidersQuery,
        private readonly signUpVerifyUseCase: SignUpVerifyUseCase,
        private readonly refreshTokensUseCase: RefreshTokensUseCase,
        private readonly resetPasswordUseCase: ResetPasswordUseCase,
        private readonly authenticateOAuthUseCase: AuthenticateOAuthUseCase,
        private readonly verifyResetPasswordUseCase: VerifyResetPasswordUseCase,
        private readonly connectProviderUseCase: ConnectProviderUseCase,
        private readonly disconnectProviderUseCase: DisconnectProviderUseCase,
        private readonly getConnectedProvidersQuery: GetConnectedProvidersQuery,
        private readonly confirmResetPasswordUseCase: ConfirmResetPasswordUseCase,
        private readonly resendCodeUseCase: ResendCodeUseCase,
    ) {}

    async signIn(dto: SignInDto, device: DeviceMetadata) {
        return this.signInUseCase.execute(dto, device);
    }

    async signUp(dto: SignUpDto) {
        return this.signUpUseCase.execute(dto);
    }

    async resendCode(dto: ResendCodeDto) {
        return this.resendCodeUseCase.execute(dto);
    }

    async verifySignUp(dto: VerifyDto, device: DeviceMetadata) {
        return this.signUpVerifyUseCase.execute(dto, device);
    }

    async signOut(token?: string) {
        return this.signOutUseCase.execute(token);
    }

    async refreshTokens(token: string | undefined, device: DeviceMetadata) {
        return this.refreshTokensUseCase.execute(token, device);
    }

    async sendResetCode(dto: ResetPasswordDto) {
        return this.resetPasswordUseCase.execute(dto);
    }

    async verifyResetCode(dto: VerifyResetCodeDto) {
        return this.verifyResetPasswordUseCase.execute(dto);
    }

    async confirmNewPassword(dto: PasswordResetConfirmDto) {
        return this.confirmResetPasswordUseCase.execute(dto);
    }

    async authenticateOAuth(dto: OAuthResponse, device: DeviceMetadata, state?: string) {
        return this.authenticateOAuthUseCase.execute(dto, device, state);
    }

    async connectProvider(provider: string, userId: string) {
        return this.connectProviderUseCase.execute(provider, userId);
    }

    async disconnectProvider(provider: string, userId: string) {
        return this.disconnectProviderUseCase.execute(provider, userId);
    }

    async getConnectedProviders(userId: string) {
        return this.getConnectedProvidersQuery.execute(userId);
    }

    async getEnabledProviders() {
        return this.getEnabledProvidersQuery.execute();
    }
}
