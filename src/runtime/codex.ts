import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";

const BLOCKED_PASSTHROUGH_OPTIONS = new Set([
  "--dangerously-bypass-approvals-and-sandbox",
  "--remote",
  "--remote-auth-token-env",
]);

const OPTIONS_REQUIRING_VALUE = new Set([
  "-a",
  "--add-dir",
  "-c",
  "-C",
  "--cd",
  "--config",
  "--disable",
  "--enable",
  "-i",
  "--image",
  "--local-provider",
  "-m",
  "--model",
  "-p",
  "--profile",
  "-s",
  "--sandbox",
  "--ask-for-approval",
]);

const OPTIONS_WITHOUT_VALUE = new Set(["--full-auto", "--no-alt-screen", "--oss", "--search"]);

export interface CodexLaunchCommand {
  command: string;
  args: string[];
  promptFilePath: string;
}

export interface RuntimeLaunchResult {
  code: number | null;
  signal: NodeJS.Signals | null;
}

function quoteArg(value: string): string {
  if (/^[a-zA-Z0-9_./:-]+$/.test(value)) {
    return value;
  }

  return JSON.stringify(value);
}

function sanitizePassthroughArgs(passthroughArgs: string[]): string[] {
  const sanitized: string[] = [];
  let waitingValueFor: string | null = null;

  for (const arg of passthroughArgs) {
    if (waitingValueFor) {
      if (arg.startsWith("-")) {
        throw new Error(`Missing value for codex passthrough option: ${waitingValueFor}`);
      }
      sanitized.push(arg);
      waitingValueFor = null;
      continue;
    }

    if (arg === "--") {
      throw new Error("passthrough arguments must not include a second -- marker");
    }

    const optionName = arg.startsWith("--") ? arg.split("=", 1)[0] : arg;

    if (BLOCKED_PASSTHROUGH_OPTIONS.has(optionName)) {
      throw new Error(`Blocked codex option in passthrough args: ${optionName}`);
    }

    if (OPTIONS_WITHOUT_VALUE.has(optionName)) {
      if (arg.includes("=")) {
        throw new Error(`Option does not accept a value: ${optionName}`);
      }
      sanitized.push(arg);
      continue;
    }

    if (OPTIONS_REQUIRING_VALUE.has(optionName)) {
      sanitized.push(arg);
      if (!arg.includes("=")) {
        waitingValueFor = optionName;
      }
      continue;
    }

    throw new Error(
      `Unsupported passthrough argument "${arg}". Use explicit codex option flags only.`,
    );
  }

  if (waitingValueFor) {
    throw new Error(`Missing value for codex passthrough option: ${waitingValueFor}`);
  }

  return sanitized;
}

export function buildCodexLaunchCommand({
  instructionFilePath,
  passthroughArgs = [],
}: {
  instructionFilePath: string;
  passthroughArgs?: string[];
}): CodexLaunchCommand {
  const sanitizedArgs = sanitizePassthroughArgs(passthroughArgs);

  return {
    command: "codex",
    args: sanitizedArgs,
    promptFilePath: instructionFilePath,
  };
}

export function formatCodexLaunchCommand({
  command,
  args,
  promptFilePath,
}: CodexLaunchCommand): string {
  const base = [command, ...args.map(quoteArg)].join(" ");
  if (promptFilePath) {
    return `${base} "<instruction text loaded from ${quoteArg(promptFilePath)}>"`;
  }
  return base;
}

export async function launchCodexWithInstruction({
  instructionFilePath,
  passthroughArgs = [],
}: {
  instructionFilePath: string;
  passthroughArgs?: string[];
}): Promise<RuntimeLaunchResult> {
  const sanitizedArgs = sanitizePassthroughArgs(passthroughArgs);
  const instructionText = await readFile(instructionFilePath, "utf8");
  const commandSpec = {
    command: "codex",
    args: [...sanitizedArgs, instructionText],
  };

  return new Promise((resolve, reject) => {
    const child = spawn(commandSpec.command, commandSpec.args, {
      stdio: "inherit",
    });

    child.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        reject(new Error("Failed to launch codex: command not found. Install Codex CLI first."));
        return;
      }
      reject(new Error(`Failed to launch codex: ${error.message}`));
    });

    child.on("exit", (code, signal) => {
      resolve({ code, signal });
    });
  });
}
