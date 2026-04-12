export const SUPPORTED_ROLES = Object.freeze(["mentor", "teacher", "coder"]);

const CORE_PROMPT_FILE = "prompts/core/00_sddl_principles.md";

const ROLE_CONFIGS = Object.freeze({
  mentor: Object.freeze({
    roleFile: "prompts/roles/mentor.md",
    templateFiles: Object.freeze([]),
  }),
  teacher: Object.freeze({
    roleFile: "prompts/roles/teacher.md",
    templateFiles: Object.freeze(["prompts/templates/teaching-note-template.md"]),
  }),
  coder: Object.freeze({
    roleFile: "prompts/roles/coder.md",
    templateFiles: Object.freeze(["prompts/templates/change-notes-template.md"]),
  }),
});

export function isSupportedRole(value) {
  return SUPPORTED_ROLES.includes(value);
}

export function getRoleConfig(role) {
  const config = ROLE_CONFIGS[role];
  if (!config) {
    throw new Error(`Unsupported role: ${role}`);
  }

  return {
    coreFile: CORE_PROMPT_FILE,
    roleFile: config.roleFile,
    templateFiles: [...config.templateFiles],
  };
}
