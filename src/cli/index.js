#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildInstruction } from "../compose/buildInstruction.js";
import { loadPromptParts } from "../compose/loadPromptParts.js";
import { resolveRoleConfig } from "../compose/resolveRoleConfig.js";
import { writeGeneratedFile } from "../fs/writeGeneratedFile.js";
import { resolveRuntimeAdapter } from "../runtime/index.js";
import { DEFAULT_RUNTIME, isSupportedRuntime, SUPPORTED_RUNTIMES } from "../types/runtime.js";
import { SUPPORTED_ROLES } from "../types/role.js";

const USAGE = `
Usage:
  sdd-l <role> [options] [-- <runtime_args...>]

Roles:
  ${SUPPORTED_ROLES.join(", ")}

Options:
  --runtime <name>     Runtime name (default: ${DEFAULT_RUNTIME})
  --launch             Launch runtime immediately after generating file
  --output-dir <path>  Output directory (default: .sdd-l/generated)
  -h, --help           Show this help
`;

function parseArgs(argv) {
  let role;
  let runtime = DEFAULT_RUNTIME;
  let launch = false;
  let outputDir = ".sdd-l/generated";
  const passthroughArgs = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "-h" || arg === "--help") {
      return { help: true };
    }

    if (arg === "--") {
      passthroughArgs.push(...argv.slice(index + 1));
      break;
    }

    if (arg === "--runtime") {
      runtime = argv[index + 1];
      index += 1;
      if (!runtime) {
        throw new Error("Missing value for --runtime");
      }
      continue;
    }

    if (arg === "--launch") {
      launch = true;
      continue;
    }

    if (arg === "--output-dir") {
      outputDir = argv[index + 1];
      index += 1;
      if (!outputDir) {
        throw new Error("Missing value for --output-dir");
      }
      continue;
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (!role) {
      role = arg;
      continue;
    }

    throw new Error(`Unexpected argument: ${arg}`);
  }

  if (!role) {
    throw new Error("Role is required");
  }

  return {
    help: false,
    role,
    runtime,
    launch,
    outputDir,
    passthroughArgs,
  };
}

async function run() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.help) {
    process.stdout.write(USAGE);
    return;
  }

  if (!isSupportedRuntime(parsed.runtime)) {
    throw new Error(
      `Unsupported runtime "${parsed.runtime}". Supported runtimes: ${SUPPORTED_RUNTIMES.join(", ")}`,
    );
  }

  const roleConfig = resolveRoleConfig(parsed.role);
  const packageRoot = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
  const promptParts = await loadPromptParts({ packageRoot, roleConfig });
  const instructionText = buildInstruction({
    role: parsed.role,
    runtime: parsed.runtime,
    parts: promptParts,
  });

  const output = await writeGeneratedFile({
    projectRoot: process.cwd(),
    role: parsed.role,
    runtime: parsed.runtime,
    instructionText,
    outputDir: parsed.outputDir,
  });

  const adapter = resolveRuntimeAdapter(parsed.runtime);
  const launchSpec = adapter.buildLaunchCommand({
    instructionFilePath: output.filePath,
    passthroughArgs: parsed.passthroughArgs,
  });

  process.stdout.write(`Generated instruction file: ${output.filePath}\n`);

  if (!parsed.launch) {
    process.stdout.write("Runtime not launched. Use --launch to execute now.\n");
    process.stdout.write(`Launch command: ${adapter.formatLaunchCommand(launchSpec)}\n`);
    return;
  }

  const result = await adapter.launch({
    instructionFilePath: output.filePath,
    passthroughArgs: parsed.passthroughArgs,
  });

  if (result.signal) {
    process.stdout.write(`Runtime exited with signal: ${result.signal}\n`);
    process.exitCode = 1;
    return;
  }

  process.exitCode = result.code ?? 0;
}

run().catch((error) => {
  process.stderr.write(`sdd-l error: ${error.message}\n`);
  process.stderr.write(USAGE);
  process.exit(1);
});
