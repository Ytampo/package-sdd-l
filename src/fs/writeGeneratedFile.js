import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function toTimestamp(date) {
  return date.toISOString().replace(/[:.]/g, "-");
}

export async function writeGeneratedFile({
  projectRoot,
  role,
  runtime,
  instructionText,
  outputDir = ".sdd-l/generated",
}) {
  const resolvedOutputDir = path.resolve(projectRoot, outputDir);
  await mkdir(resolvedOutputDir, { recursive: true });

  const filename = `${toTimestamp(new Date())}-${role}-${runtime}-instruction.md`;
  const filePath = path.join(resolvedOutputDir, filename);

  await writeFile(filePath, instructionText, "utf8");

  return {
    outputDir: resolvedOutputDir,
    filePath,
  };
}
