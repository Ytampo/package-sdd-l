import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";

function quoteArg(value) {
  if (/^[a-zA-Z0-9_./:-]+$/.test(value)) {
    return value;
  }

  return JSON.stringify(value);
}

export function buildCodexLaunchCommand({ instructionFilePath, passthroughArgs = [] }) {
  return {
    command: "codex",
    args: [...passthroughArgs],
    promptFilePath: instructionFilePath,
  };
}

export function formatCodexLaunchCommand({ command, args, promptFilePath }) {
  const base = [command, ...args.map(quoteArg)].join(" ");
  if (promptFilePath) {
    return `${base} "$(cat ${quoteArg(promptFilePath)})"`;
  }
  return base;
}

export function launchCodexWithInstruction({ instructionFilePath, passthroughArgs = [] }) {
  return readFile(instructionFilePath, "utf8").then((instructionText) => {
    const commandSpec = {
      command: "codex",
      args: [...passthroughArgs, instructionText],
    };

    return new Promise((resolve, reject) => {
      const child = spawn(commandSpec.command, commandSpec.args, {
        stdio: "inherit",
      });

      child.on("error", (error) => {
        reject(new Error(`Failed to launch codex: ${error.message}`));
      });

      child.on("exit", (code, signal) => {
        resolve({ code, signal });
      });
    });
  });
}
