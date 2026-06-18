import { ADMIN_PERMISSIONS } from '@shared/authorization/permissions/admin.permissions';
import { MEMBER_PERMISSIONS } from '@shared/authorization/permissions/member.permissions';
import { OWNER_PERMISSIONS } from '@shared/authorization/permissions/owner.permissions';
import { VIEWER_PERMISSIONS } from '@shared/authorization/permissions/viewer.permissions';

import type { TeamRole } from '../../../team/infrastructure/persistence/models';
import type { PermissionRule } from '@shared/authorization/types/permission-rule.interface';

export const ROLE_PERMISSIONS_MAP: Record<TeamRole, PermissionRule[]> = {
    owner: OWNER_PERMISSIONS,
    admin: ADMIN_PERMISSIONS,
    member: MEMBER_PERMISSIONS,
    viewer: VIEWER_PERMISSIONS,
};
