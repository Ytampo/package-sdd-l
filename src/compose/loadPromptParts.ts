import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PromptPart, PromptPartKind, RoleConfig } from "../types/role.js";

interface LoadPromptPartsParams {
  packageRoot: string;
  roleConfig: RoleConfig;
}

async function loadPromptFile(
  packageRoot: string,
  relativePath: string,
  kind: PromptPartKind,
): Promise<PromptPart> {
  const absolutePath = path.resolve(packageRoot, relativePath);

  try {
    const content = await readFile(absolutePath, "utf8");
    return {
      kind,
      relativePath,
      content,
    };
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read prompt file "${relativePath}": ${reason}`);
  }
}

export async function loadPromptParts({
  packageRoot,
  roleConfig,
}: LoadPromptPartsParams): Promise<PromptPart[]> {
  const parts: PromptPart[] = [];

  parts.push(await loadPromptFile(packageRoot, roleConfig.coreFile, "core"));
  parts.push(await loadPromptFile(packageRoot, roleConfig.roleFile, "role"));

  for (const templateFile of roleConfig.templateFiles) {
    parts.push(await loadPromptFile(packageRoot, templateFile, "template"));
  }

  return parts;
}
