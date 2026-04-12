import { getRoleConfig, isSupportedRole, SUPPORTED_ROLES } from "../types/role.js";
import type { RoleConfig } from "../types/role.js";

export function resolveRoleConfig(role: string): RoleConfig {
  if (!isSupportedRole(role)) {
    throw new Error(`Unsupported role "${role}". Supported roles: ${SUPPORTED_ROLES.join(", ")}`);
  }

  return getRoleConfig(role);
}
