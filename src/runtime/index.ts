import { buildCodexLaunchCommand, formatCodexLaunchCommand, launchCodexWithInstruction } from "./codex.js";
import type { CodexLaunchCommand, RuntimeLaunchResult } from "./codex.js";
import type { Runtime } from "../types/runtime.js";

export interface RuntimeAdapter {
  name: Runtime;
  buildLaunchCommand: (params: {
    instructionFilePath: string;
    passthroughArgs?: string[];
  }) => CodexLaunchCommand;
  formatLaunchCommand: (command: CodexLaunchCommand) => string;
  launch: (params: {
    instructionFilePath: string;
    passthroughArgs?: string[];
  }) => Promise<RuntimeLaunchResult>;
}

export function resolveRuntimeAdapter(runtime: Runtime): RuntimeAdapter {
  if (runtime === "codex") {
    return {
      name: "codex",
      buildLaunchCommand: buildCodexLaunchCommand,
      formatLaunchCommand: formatCodexLaunchCommand,
      launch: launchCodexWithInstruction,
    };
  }

  throw new Error(`Unsupported runtime: ${runtime}`);
}
