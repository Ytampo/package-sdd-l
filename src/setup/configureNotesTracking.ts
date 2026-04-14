import { appendFile, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";

type NotesTrackingChoice = "track" | "ignore";

const NOTES_DIR_NAME = "sdd-l-notes";
const GITIGNORE_ENTRY = `${NOTES_DIR_NAME}/`;

function isInteractiveInstall(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY && process.env.CI !== "true");
}

function parseChoiceFromEnv(value: string | undefined): NotesTrackingChoice | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "track") {
    return "track";
  }

  if (normalized === "ignore") {
    return "ignore";
  }

  return undefined;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function shouldPromptForTracking(projectRoot: string): Promise<boolean> {
  const gitPath = path.join(projectRoot, ".git");
  const gitignorePath = path.join(projectRoot, ".gitignore");

  if (await pathExists(gitPath)) {
    return true;
  }

  if (await pathExists(gitignorePath)) {
    return true;
  }

  return false;
}

async function promptTrackingChoice(): Promise<NotesTrackingChoice> {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = (await readline.question("Track sdd-l-notes in git? [Y/n]: "))
      .trim()
      .toLowerCase();

    if (answer === "" || answer === "y" || answer === "yes") {
      return "track";
    }

    if (answer === "n" || answer === "no") {
      return "ignore";
    }

    process.stdout.write("[sdd-l] Invalid input. Defaulting to track.\n");
    return "track";
  } finally {
    readline.close();
  }
}

function hasGitignoreEntry(content: string): boolean {
  return content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .some((line) => {
      const trimmed = line.trim();
      return trimmed === NOTES_DIR_NAME || trimmed === GITIGNORE_ENTRY;
    });
}

async function ensureNotesIgnored(projectRoot: string): Promise<"added" | "already"> {
  const gitignorePath = path.join(projectRoot, ".gitignore");
  let content = "";

  try {
    content = await readFile(gitignorePath, "utf8");
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: string }).code)
        : "";

    if (code !== "ENOENT") {
      throw error;
    }
  }

  if (hasGitignoreEntry(content)) {
    return "already";
  }

  const needsLeadingNewline = content.length > 0 && !content.endsWith("\n");
  const nextContent = `${needsLeadingNewline ? "\n" : ""}${GITIGNORE_ENTRY}\n`;
  await appendFile(gitignorePath, nextContent, "utf8");
  return "added";
}

function shouldSkip(): boolean {
  if (process.env.npm_config_global === "true") {
    return true;
  }

  return false;
}

async function run(): Promise<void> {
  if (shouldSkip()) {
    return;
  }

  const projectRoot = process.env.INIT_CWD ? path.resolve(process.env.INIT_CWD) : process.cwd();
  const shouldPrompt = await shouldPromptForTracking(projectRoot);

  if (!shouldPrompt) {
    return;
  }

  const envChoice = parseChoiceFromEnv(process.env.SDDL_NOTES_GIT);
  const choice = envChoice ?? (isInteractiveInstall() ? await promptTrackingChoice() : "track");

  if (choice === "track") {
    process.stdout.write("[sdd-l] sdd-l-notes will be tracked by git.\n");
    return;
  }

  const result = await ensureNotesIgnored(projectRoot);

  if (result === "added") {
    process.stdout.write(`[sdd-l] Added "${GITIGNORE_ENTRY}" to ${path.join(projectRoot, ".gitignore")}.\n`);
    return;
  }

  process.stdout.write(`[sdd-l] "${GITIGNORE_ENTRY}" is already present in .gitignore.\n`);
}

run().catch((error: unknown) => {
  const reason = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[sdd-l] postinstall warning: ${reason}\n`);
});
