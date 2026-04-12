import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Role } from "../types/role.js";
import type { Runtime } from "../types/runtime.js";

interface WriteGeneratedFileParams {
  projectRoot: string;
  role: Role;
  runtime: Runtime;
  instructionText: string;
  outputDir?: string;
}

interface GeneratedFileResult {
  outputDir: string;
  filePath: string;
}

function toTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function ensurePathWithinProjectRoot(projectRoot: string, targetPath: string): void {
  const relativePath = path.relative(projectRoot, targetPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("output directory must be inside the current project directory");
  }
}

export async function writeGeneratedFile({
  projectRoot,
  role,
  runtime,
  instructionText,
  outputDir = ".sdd-l/generated",
}: WriteGeneratedFileParams): Promise<GeneratedFileResult> {
  const resolvedOutputDir = path.resolve(projectRoot, outputDir);
  ensurePathWithinProjectRoot(projectRoot, resolvedOutputDir);
  await mkdir(resolvedOutputDir, { recursive: true });

  const filename = `${toTimestamp(new Date())}-${role}-${runtime}-instruction.md`;
  const filePath = path.join(resolvedOutputDir, filename);

  await writeFile(filePath, instructionText, "utf8");

  return {
    outputDir: resolvedOutputDir,
    filePath,
  };
}
