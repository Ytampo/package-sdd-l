import type { PromptPart, Role } from "../types/role.js";
import type { Runtime } from "../types/runtime.js";

interface BuildInstructionParams {
  role: Role;
  runtime: Runtime;
  featureId?: string;
  parts: PromptPart[];
  generatedAt?: Date;
}

const ROLE_NOTE_ROOT: Record<Role, string> = {
  mentor: ".sdd-l/notes/mentor",
  coder: ".sdd-l/notes/coder",
  teacher: ".sdd-l/notes/teacher",
};

function buildRoleNotePolicy(role: Role): string[] {
  const noteRoot = ROLE_NOTE_ROOT[role];

  if (role === "mentor") {
    return [
      "## 0.5 NOTE FILE POLICY",
      "",
      `- Write mentor markdown files under \`${noteRoot}/\`.`,
      "- For spec or issue discussion outputs, create or update markdown files in this directory.",
      "- Decide whether to create a new file or update an existing file based on context.",
      "- Suggested filename format: `YYYY-MM-DD-<topic>.md`.",
      "- After writing files, report changed file paths and a short summary in chat.",
      "",
      "---",
      "",
    ];
  }

  if (role === "coder") {
    return [
      "## 0.5 NOTE FILE POLICY",
      "",
      `- Write coder markdown files under \`${noteRoot}/\`.`,
      "- The template is not for chat-only output.",
      "- Use `prompts/templates/change-notes-template.md` as a reference when writing markdown files.",
      "- Decide whether to create a new file or update an existing file based on context.",
      "- Suggested filename format: `YYYY-MM-DD-<topic>-change-notes.md`.",
      "- After writing files, report changed file paths and a short summary in chat.",
      "",
      "---",
      "",
    ];
  }

  return [
    "## 0.5 NOTE FILE POLICY",
    "",
    `- Write teacher markdown files under \`${noteRoot}/\`.`,
    "- The template is not for chat-only output.",
    "- Use `prompts/templates/teaching-note-template.md` as a reference when writing markdown files.",
    "- Decide whether to create a new file or update an existing file based on context.",
    "- Suggested filename format: `YYYY-MM-DD-<topic>-teaching-note.md`.",
    "- After writing files, report changed file paths and a short summary in chat.",
    "",
    "---",
    "",
  ];
}

function formatSection(part: PromptPart, index: number): string {
  const title = `## ${index + 1}. ${part.kind.toUpperCase()} (${part.relativePath})`;
  return `${title}\n\n${part.content.trim()}\n`;
}

export function buildInstruction({
  role,
  runtime,
  featureId,
  parts,
  generatedAt = new Date(),
}: BuildInstructionParams): string {
  const lines = [
    "# SDD-L Generated Instruction",
    "",
    `- role: ${role}`,
    `- runtime: ${runtime}`,
    ...(featureId ? [`- feature: ${featureId}`] : []),
    `- generated_at: ${generatedAt.toISOString()}`,
    "",
    "## 0. STARTUP BEHAVIOR",
    "",
    "- On startup, do not inspect project files or directories on your own.",
    "- On startup, do not run any shell commands on your own.",
    `- Your first assistant message must be exactly: "READY: role=${role} runtime=${runtime}".`,
    "- Do not include any extra words in the first assistant message.",
    "- Start exploration only after explicit user instruction.",
    "",
    "---",
    "",
    ...buildRoleNotePolicy(role),
  ];

  const sections = parts.map((part, index) => formatSection(part, index)).join("\n---\n\n");

  return `${lines.join("\n")}${sections}`;
}
