import { z } from 'zod/v4';
import { createZodDto } from 'nestjs-zod';
import type { TeamRole } from '../../infrastructure/persistence/models/enums';
import { roleEnum } from '../../infrastructure/persistence/models/enums';
import { createPaginationSchema } from '@shared/schemas';

export const UpdateInvitationSchema = z.object({
    role: z
        .enum(roleEnum.enumValues)
        .describe('Новая роль, которая будет назначена пользователю после принятия инвайта'),
});

export class UpdateInvitationDto extends createZodDto(UpdateInvitationSchema) {}

export const TeamInvitationSchema = z.object({
    code: z.string().describe('Код инвайта'),
    teamId: z.string().describe('ID команды'),
    teamName: z.string().describe('Название команды'),
    teamAvatar: z.string().nullable().describe('Аватар команды'),
    email: z.string().email().describe('Email приглашённого пользователя'),
    role: z.string().describe('Роль, которая будет назначена после принятия инвайта'),
    inviterId: z.string().describe('ID пользователя, отправившего приглашение'),
    inviterName: z.string().describe('Имя пригласившего'),
    createdAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата создания инвайта (ISO 8601)'),
    expiresAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Строка не является валидной датой',
        })
        .describe('Дата истечения инвайта (ISO 8601)'),
});

export class TeamInvitationResponse extends createZodDto(TeamInvitationSchema) {}

export class TeamInvitationsResponse extends createZodDto(
    createPaginationSchema(TeamInvitationSchema),
) {}

export interface TeamInvite {
    readonly teamId: string;
    readonly teamName: string;
    readonly teamAvatar: string | null;
    readonly email: string;
    readonly role: TeamRole;
    readonly inviterId: string;
    readonly inviterName: string;
    readonly createdAt: string;
    readonly expiresAt: string;
}
