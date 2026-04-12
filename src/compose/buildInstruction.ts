import type { PromptPart, Role } from "../types/role.js";
import type { Runtime } from "../types/runtime.js";

interface BuildInstructionParams {
  role: Role;
  runtime: Runtime;
  featureId: string;
  parts: PromptPart[];
  generatedAt?: Date;
}

interface FeaturePaths {
  featureRoot: string;
  specFile: string;
  issueDraftFile: string;
  metaFile: string;
  changeNotesFile: string;
  teachingNoteFile: string;
}

function buildFeaturePaths(featureId: string): FeaturePaths {
  const featureRoot = `.sdd-l/features/${featureId}`;

  return {
    featureRoot,
    specFile: `${featureRoot}/${featureId}-spec.md`,
    issueDraftFile: `${featureRoot}/${featureId}-issue.md`,
    metaFile: `${featureRoot}/meta.json`,
    changeNotesFile: `${featureRoot}/change-notes.md`,
    teachingNoteFile: `${featureRoot}/teaching-note.md`,
  };
}

function buildCommonWorkflowPolicy(paths: FeaturePaths): string[] {
  return [
    "## 0.5 FEATURE WORKFLOW POLICY",
    "",
    "- This session is bound to one feature folder.",
    `- Feature root: \`${paths.featureRoot}/\`.`,
    `- Single source of truth for spec: \`${paths.specFile}\`.`,
    "- Do not mix content from different features in the same file.",
    "",
    "---",
    "",
  ];
}

function buildRoleWorkflowPolicy(role: Role, paths: FeaturePaths): string[] {
  if (role === "mentor") {
    return [
      "## 0.6 MENTOR FEATURE POLICY",
      "",
      `- Ensure directory \`${paths.featureRoot}/\` exists.`,
      `- Create or update the feature spec at \`${paths.specFile}\`.`,
      `- Create or update issue draft at \`${paths.issueDraftFile}\` based on the spec.`,
      `- Track issue linkage in \`${paths.metaFile}\` (for example: issue number, URL, status).`,
      "- The issue should reference the spec file as the canonical source.",
      "",
      "---",
      "",
    ];
  }

  if (role === "coder") {
    return [
      "## 0.6 CODER FEATURE POLICY",
      "",
      `- Read \`${paths.specFile}\` first and implement strictly against it.`,
      "- The template is not for chat-only output.",
      `- Use \`prompts/templates/change-notes-template.md\` to create or update \`${paths.changeNotesFile}\`.`,
      `- Keep all coder notes for this feature inside \`${paths.featureRoot}/\`.`,
      "- After writing files, report changed paths and short summary in chat.",
      "",
      "---",
      "",
    ];
  }

  if (role === "teacher") {
    return [
      "## 0.6 TEACHER FEATURE POLICY",
      "",
      `- Read \`${paths.specFile}\` and coder outputs for this feature first.`,
      "- The template is not for chat-only output.",
      `- Use \`prompts/templates/teaching-note-template.md\` to create or update \`${paths.teachingNoteFile}\` when note output is needed.`,
      `- Keep all teacher notes for this feature inside \`${paths.featureRoot}/\`.`,
      "- After writing files, report changed paths and short summary in chat.",
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
  const featurePaths = buildFeaturePaths(featureId);
  const lines = [
    "# SDD-L Generated Instruction",
    "",
    `- role: ${role}`,
    `- runtime: ${runtime}`,
    `- feature_id: ${featureId}`,
    `- generated_at: ${generatedAt.toISOString()}`,
    "",
    "## 0. STARTUP BEHAVIOR",
    "",
    "- On startup, do not inspect project files or directories on your own.",
    "- On startup, do not run any shell commands on your own.",
    `- Your first assistant message must be exactly: "READY: role=${role} runtime=${runtime} feature=${featureId}".`,
    "- Do not include any extra words in the first assistant message.",
    "- Start exploration only after explicit user instruction.",
    "",
    "---",
    "",
    ...buildCommonWorkflowPolicy(featurePaths),
    ...buildRoleWorkflowPolicy(role, featurePaths),
  ];

  const sections = parts.map((part, index) => formatSection(part, index)).join("\n---\n\n");

  return `${lines.join("\n")}${sections}`;
}
