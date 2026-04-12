import { buildCodexLaunchCommand, formatCodexLaunchCommand, launchCodexWithInstruction } from "./codex.js";

export function resolveRuntimeAdapter(runtime) {
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
