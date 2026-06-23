import { createCursorResponseSchema } from '@shared/schemas';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const ProjectMemberRoleSchema = z.enum(['owner', 'admin', 'member', 'viewer']);
export type ProjectMemberRole = z.infer<typeof ProjectMemberRoleSchema>;

export const ProjectMemberSchema = z
    .object({
        id: z
            .string()
            .min(1, 'ID не может быть пустым')
            .describe('Уникальный идентификатор записи'),
        projectId: z.string().min(1, 'ID проекта обязателен').describe('ID проекта'),
        userId: z
            .string()
            .min(1, 'ID пользователя обязателен')
            .describe('ID пользователя — участника проекта'),
        role: ProjectMemberRoleSchema.default('member').describe('Роль участника в проекте'),
        addedBy: z
            .string()
            .nullable()
            .optional()
            .describe('ID пользователя, который добавил участника'),
        createdAt: z.string().datetime({ offset: true }).describe('Дата добавления в проект'),
    })
    .describe('Участник проекта');

export const MemberUserSchema = z.object({
    id: z.string().describe('ID пользователя'),
    email: z.string().email().describe('Email'),
    firstName: z.string().nullable().optional().describe('Имя'),
    lastName: z.string().nullable().optional().describe('Фамилия'),
    avatarUrl: z.string().nullable().optional().describe('URL аватара'),
});

const MemberResponseSchema = ProjectMemberSchema.omit({
    userId: true,
    projectId: true,
}).extend({
    user: MemberUserSchema,
});

export const ProjectMemberListResponseSchema = createCursorResponseSchema(MemberResponseSchema);

export const AddProjectMemberSchema = z
    .object({
        userId: z
            .string()
            .min(1, 'ID пользователя обязателен')
            .describe('ID пользователя для добавления в проект'),
        role: ProjectMemberRoleSchema.exclude(['owner'])
            .default('member')
            .describe('Роль нового участника'),
    })
    .describe('Схема для добавления участника');

export const UpdateProjectMemberSchema = z
    .object({
        role: ProjectMemberRoleSchema.exclude(['owner']).describe('Новая роль участника'),
    })
    .describe('Схема для изменения роли участника');

export class AddProjectMemberDto extends createZodDto(AddProjectMemberSchema) {}
export class UpdateProjectMemberDto extends createZodDto(UpdateProjectMemberSchema) {}
export class ListMembersResponse extends createZodDto(ProjectMemberListResponseSchema) {}
