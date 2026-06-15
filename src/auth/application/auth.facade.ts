import { Injectable } from '@nestjs/common';

import {
    ExchangeDto,
    OAuthResponse,
    PasswordResetConfirmDto,
    ResendCodeDto,
    ResetPasswordDto,
    SignInDto,
    SignUpDto,
    VerifyDto,
    VerifyResetCodeDto,
} from './dtos';
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
    ExchangeUseCase,
} from './use-cases';

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
        private readonly exchangeTokenUC: ExchangeUseCase,
    ) {}

    public async signIn(dto: SignInDto, device: DeviceMetadata) {
        return this.signInUseCase.execute(dto, device);
    }

    public async signUp(dto: SignUpDto) {
        return this.signUpUseCase.execute(dto);
    }

    public async resendCode(dto: ResendCodeDto) {
        return this.resendCodeUseCase.execute(dto);
    }

    public async verifySignUp(dto: VerifyDto, device: DeviceMetadata) {
        return this.signUpVerifyUseCase.execute(dto, device);
    }

    public async signOut(token?: string) {
        return this.signOutUseCase.execute(token);
    }

    public async refreshTokens(token: string | undefined, device: DeviceMetadata) {
        return this.refreshTokensUseCase.execute(token, device);
    }

    public async sendResetCode(dto: ResetPasswordDto) {
        return this.resetPasswordUseCase.execute(dto);
    }

    public async verifyResetCode(dto: VerifyResetCodeDto) {
        return this.verifyResetPasswordUseCase.execute(dto);
    }

    public async confirmNewPassword(dto: PasswordResetConfirmDto) {
        return this.confirmResetPasswordUseCase.execute(dto);
    }

    public async exchangeToken(dto: ExchangeDto, device: DeviceMetadata) {
        return this.exchangeTokenUC.execute(dto, device);
    }

    public async authenticateOAuth(dto: OAuthResponse, device: DeviceMetadata, state?: string) {
        return this.authenticateOAuthUseCase.execute(dto, device, state);
    }

    public async connectProvider(provider: string, userId: string) {
        return this.connectProviderUseCase.execute(provider, userId);
    }

    public async disconnectProvider(provider: string, userId: string) {
        return this.disconnectProviderUseCase.execute(provider, userId);
    }

    public async getConnectedProviders(userId: string) {
        return this.getConnectedProvidersQuery.execute(userId);
    }

    public async getEnabledProviders() {
        return this.getEnabledProvidersQuery.execute();
    }
}
