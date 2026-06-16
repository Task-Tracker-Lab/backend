import { ActionResponseSchema } from '@shared/schemas';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const SignInSchema = z
    .object({
        email: z.email('Некорректный формат email').describe('Email пользователя'),
        password: z.string().describe('Пароль пользователя'),
    })
    .describe('Схема входа в систему');

export class SignInDto extends createZodDto(SignInSchema) {}

export const SignUpSchema = z
    .object({
        email: z.email('Некорректный формат email').describe('Email пользователя'),
        password: z
            .string()
            .min(8, 'Пароль должен содержать минимум 8 символов')
            .max(32, 'Пароль должен содержать максимум 32 символа')
            .describe('Пароль (минимум 8 символов)'),
        firstName: z
            .string()
            .min(2, 'Имя должно содержать минимум 2 символа')
            .max(50)
            .trim()
            .describe('Имя'),
        lastName: z
            .string()
            .min(2, 'Фамилия должна содержать минимум 2 символа')
            .max(50)
            .trim()
            .describe('Фамилия'),
        middleName: z
            .string()
            .max(50)
            .trim()
            .optional()
            .or(z.literal(''))
            .describe('Отчество (опционально)'),
    })
    .describe('Схема регистрации пользователя');

export class SignUpDto extends createZodDto(SignUpSchema) {}

export const VerifySchema = z
    .object({
        email: z
            .string()
            .email('Некорректный формат email')
            .describe('Email пользователя, на который был отправлен код'),
        code: z
            .string()
            .length(6, 'Код должен содержать ровно 6 символов')
            .describe('6-значный OTP код подтверждения'),
    })
    .describe('Схема верификации OTP кода');

export class VerifyDto extends createZodDto(VerifySchema) {}

export const SignResponseSchema = ActionResponseSchema.extend({
    token: z.string().describe('JWT токен доступа пользователя'),
});

export class SignResponse extends createZodDto(SignResponseSchema) {}

export const ResendCodeSchema = z.object({
    context: z
        .enum(['sign-up', 'reset-password'], {
            error: 'Выберите корректный контекст: sign-up или reset-password',
        })
        .describe('Контекст, для которого нужно отправить код (регистрация или сброс пароля)'),
    email: z.email('Некорректный формат email').describe('Email пользователя'),
});

export class ResendCodeDto extends createZodDto(ResendCodeSchema) {}

export const ResendCodeResponseSchema = ActionResponseSchema.extend({
    nextResendAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Время, когда можно запросить повторную отправку кода (ISO 8601)'),
    retryAfterSeconds: z
        .number()
        .int()
        .positive()
        .describe('Секунды до следующей доступной отправки'),
    retries: z
        .number()
        .int()
        .nonnegative()
        .describe('Количество повторных отправок в текущем окне'),
});

export class ResendCodeResponse extends createZodDto(ResendCodeResponseSchema) {}
