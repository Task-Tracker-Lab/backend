// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ResendCodeDto } from '../dtos';
import { ResetPasswordResendStrategy } from './reset-password-resend.strategy';
import type { ResendCodeStrategy } from './resend-code.strategy';
import { SignUpResendStrategy } from './sign-up-resend.strategy';

export const RESEND_CODE_STRATEGIES: Record<ResendCodeDto['context'], ResendCodeStrategy> = {
    'sign-up': new SignUpResendStrategy(),
    'reset-password': new ResetPasswordResendStrategy(),
};

export { ResendCodeStrategy } from './resend-code.strategy';
