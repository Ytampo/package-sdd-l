import type { PromptPart, Role } from "../types/role.js";
import type { Runtime } from "../types/runtime.js";

interface BuildInstructionParams {
  role: Role;
  runtime: Runtime;
  parts: PromptPart[];
  generatedAt?: Date;
}

function buildTemplateFilePolicy(role: Role): string[] {
  if (role === "coder") {
    return [
      "## 0.5 TEMPLATE FILE POLICY",
      "",
      "- The template is not for chat-only output.",
      "- Use `prompts/templates/change-notes-template.md` as a reference to create or update `CHANGE_NOTES.md` in the project root.",
      "- After writing the file, report the file path and a short summary in chat.",
      "",
      "---",
      "",
    ];
  }

  if (role === "teacher") {
    return [
      "## 0.5 TEMPLATE FILE POLICY",
      "",
      "- The template is not for chat-only output.",
      "- Use `prompts/templates/teaching-note-template.md` as a reference to create or update `TEACHING_NOTE.md` in the project root when note output is needed.",
      "- After writing the file, report the file path and a short summary in chat.",
      "",
      "---",
      "",
    ];
  }

  return [];
}

function formatSection(part: PromptPart, index: number): string {
  const title = `## ${index + 1}. ${part.kind.toUpperCase()} (${part.relativePath})`;
  return `${title}\n\n${part.content.trim()}\n`;
}

export function buildInstruction({
  role,
  runtime,
  parts,
  generatedAt = new Date(),
}: BuildInstructionParams): string {
  const lines = [
    "# SDD-L Generated Instruction",
    "",
    `- role: ${role}`,
    `- runtime: ${runtime}`,
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
    ...buildTemplateFilePolicy(role),
  ];

  const sections = parts.map((part, index) => formatSection(part, index)).join("\n---\n\n");

  return `${lines.join("\n")}${sections}`;
}
