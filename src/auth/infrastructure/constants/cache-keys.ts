export const SIGNUP_CACHE_KEY = (email: string) => `reg:${email}`;
export const RESET_PASSWORD_CACHE_KEY = (email: string) => `pass:reset:${email}`;
export const RESEND_CODE_RATE_LIMIT_KEY = (context: string, email: string) =>
    `resend:limit:${context}:${email}`;

export const RESEND_CODE_COOLDOWN_SECONDS = 60;
