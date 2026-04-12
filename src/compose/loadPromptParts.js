import { readFile } from "node:fs/promises";
import path from "node:path";

async function loadPromptFile(packageRoot, relativePath, kind) {
  const absolutePath = path.resolve(packageRoot, relativePath);

  try {
    const content = await readFile(absolutePath, "utf8");
    return {
      kind,
      relativePath,
      content,
    };
  } catch (error) {
    throw new Error(`Failed to read prompt file "${relativePath}": ${error.message}`);
  }
}

export async function loadPromptParts({ packageRoot, roleConfig }) {
  const parts = [];

  parts.push(await loadPromptFile(packageRoot, roleConfig.coreFile, "core"));
  parts.push(await loadPromptFile(packageRoot, roleConfig.roleFile, "role"));

  for (const templateFile of roleConfig.templateFiles) {
    parts.push(await loadPromptFile(packageRoot, templateFile, "template"));
  }

  return parts;
}
