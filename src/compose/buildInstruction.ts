import type { PromptPart, Role } from "../types/role.js";
import type { Runtime } from "../types/runtime.js";

interface BuildInstructionParams {
  role: Role;
  runtime: Runtime;
  featureId?: string;
  parts: PromptPart[];
  generatedAt?: Date;
}

function buildTemplateFilePolicy(role: Role, featureId?: string): string[] {
  const featurePath = featureId ? `.sdd-l/notes/${featureId}` : ".sdd-l/notes/<feature-id>";

  if (role === "coder") {
    return [
      "## 0.5 TEMPLATE FILE POLICY",
      "",
      "- The template is not for chat-only output.",
      "- Create notes per feature. Do not merge multiple features into a single notes file.",
      `- Use \`prompts/templates/change-notes-template.md\` as a reference to create or update \`${featurePath}/change-notes.md\`.`,
      `- Ensure directory \`${featurePath}/\` exists before writing the file.`,
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
      "- Create notes per feature. Do not merge multiple features into a single notes file.",
      `- Use \`prompts/templates/teaching-note-template.md\` as a reference to create or update \`${featurePath}/teaching-note.md\` when note output is needed.`,
      `- Ensure directory \`${featurePath}/\` exists before writing the file.`,
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
  featureId,
  parts,
  generatedAt = new Date(),
}: BuildInstructionParams): string {
  const lines = [
    "# SDD-L Generated Instruction",
    "",
    `- role: ${role}`,
    `- runtime: ${runtime}`,
    ...(featureId ? [`- feature_id: ${featureId}`] : []),
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
    ...buildTemplateFilePolicy(role, featureId),
  ];

  const sections = parts.map((part, index) => formatSection(part, index)).join("\n---\n\n");

  return `${lines.join("\n")}${sections}`;
}
