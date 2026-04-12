export const SUPPORTED_ROLES = ["mentor", "teacher", "coder"] as const;
export type Role = (typeof SUPPORTED_ROLES)[number];
export type PromptPartKind = "core" | "role" | "template";

export interface RoleConfig {
  coreFile: string;
  roleFile: string;
  templateFiles: string[];
}

export interface PromptPart {
  kind: PromptPartKind;
  relativePath: string;
  content: string;
}

const CORE_PROMPT_FILE = "prompts/core/00_sddl_principles.md";

const ROLE_CONFIGS: Record<Role, Omit<RoleConfig, "coreFile">> = {
  mentor: {
    roleFile: "prompts/roles/mentor.md",
    templateFiles: [],
  },
  teacher: {
    roleFile: "prompts/roles/teacher.md",
    templateFiles: ["prompts/templates/teaching-note-template.md"],
  },
  coder: {
    roleFile: "prompts/roles/coder.md",
    templateFiles: ["prompts/templates/change-notes-template.md"],
  },
};

export function isSupportedRole(value: string): value is Role {
  return (SUPPORTED_ROLES as readonly string[]).includes(value);
}

export function getRoleConfig(role: Role): RoleConfig {
  const config = ROLE_CONFIGS[role];

  return {
    coreFile: CORE_PROMPT_FILE,
    roleFile: config.roleFile,
    templateFiles: [...config.templateFiles],
  };
}
