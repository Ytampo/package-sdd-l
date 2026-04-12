import { getRoleConfig, isSupportedRole, SUPPORTED_ROLES } from "../types/role.js";

export function resolveRoleConfig(role) {
  if (!isSupportedRole(role)) {
    throw new Error(`Unsupported role "${role}". Supported roles: ${SUPPORTED_ROLES.join(", ")}`);
  }

  return getRoleConfig(role);
}
