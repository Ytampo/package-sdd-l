#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildInstruction } from "../compose/buildInstruction.js";
import { loadPromptParts } from "../compose/loadPromptParts.js";
import { resolveRoleConfig } from "../compose/resolveRoleConfig.js";
import { writeGeneratedFile } from "../fs/writeGeneratedFile.js";
import { resolveRuntimeAdapter } from "../runtime/index.js";
import { DEFAULT_RUNTIME, isSupportedRuntime, SUPPORTED_RUNTIMES } from "../types/runtime.js";
import { isSupportedRole, SUPPORTED_ROLES } from "../types/role.js";
import type { Runtime } from "../types/runtime.js";
import type { Role } from "../types/role.js";

const USAGE = `
Usage:
  sdd-l <role> [options] [-- <runtime_args...>]

Roles:
  ${SUPPORTED_ROLES.join(", ")}

Options:
  --runtime <name>     Runtime name (default: ${DEFAULT_RUNTIME})
  --no-launch          Do not launch runtime (generation only)
  --output-dir <path>  Output directory (default: .sdd-l/generated)
  -f, --feature <id>   Optional context label for this run
  -h, --help           Show this help
`;

interface ParsedHelpArgs {
  help: true;
}

interface ParsedRunArgs {
  help: false;
  role: string;
  runtime: string;
  launch: boolean;
  outputDir: string;
  feature?: string;
  passthroughArgs: string[];
}

type ParsedArgs = ParsedHelpArgs | ParsedRunArgs;

function buildSessionBanner({
  role,
  runtime,
  mode,
  featureId,
}: {
  role: Role;
  runtime: Runtime;
  mode: "prepare" | "launch";
  featureId?: string;
}): string {
  const featureSegment = featureId ? ` feature_id=${featureId}` : "";
  return `[SDD-L] role=${role} runtime=${runtime}${featureSegment} mode=${mode}`;
}

function validateFeatureId(featureId: string): string {
  if (!/^[a-zA-Z0-9._-]+$/.test(featureId)) {
    throw new Error(
      "Invalid --feature. Use only letters, numbers, dot (.), underscore (_), and hyphen (-).",
    );
  }

  return featureId;
}

function parseArgs(argv: string[]): ParsedArgs {
  let role: string | undefined;
  let runtime: string = DEFAULT_RUNTIME;
  let launch = true;
  let outputDir = ".sdd-l/generated";
  let feature: string | undefined;
  const passthroughArgs: string[] = [];

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

    if (arg === "--no-launch") {
      launch = false;
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

    if (arg === "-f" || arg === "--feature" || arg === "--feature-id") {
      feature = argv[index + 1];
      index += 1;
      if (!feature) {
        throw new Error("Missing value for --feature");
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
    feature,
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

  if (!isSupportedRole(parsed.role)) {
    throw new Error(`Unsupported role "${parsed.role}". Supported roles: ${SUPPORTED_ROLES.join(", ")}`);
  }

  const runtime: Runtime = parsed.runtime;
  const role: Role = parsed.role;
  const validatedFeatureId = parsed.feature ? validateFeatureId(parsed.feature) : undefined;

  const roleConfig = resolveRoleConfig(parsed.role);
  const packageRoot = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
  const promptParts = await loadPromptParts({ packageRoot, roleConfig });
  const instructionText = buildInstruction({
    role,
    runtime,
    featureId: validatedFeatureId,
    parts: promptParts,
  });

  const output = await writeGeneratedFile({
    projectRoot: process.cwd(),
    role,
    runtime,
    instructionText,
    outputDir: parsed.outputDir,
  });

  const adapter = resolveRuntimeAdapter(runtime);
  const launchSpec = adapter.buildLaunchCommand({
    instructionFilePath: output.filePath,
    passthroughArgs: parsed.passthroughArgs,
  });

  process.stdout.write(`Generated instruction file: ${output.filePath}\n`);
  process.stdout.write(
    `${buildSessionBanner({
      role,
      runtime,
      featureId: validatedFeatureId,
      mode: parsed.launch ? "launch" : "prepare",
    })}\n`,
  );

  if (!parsed.launch) {
    process.stdout.write("Runtime not launched (--no-launch specified).\n");
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

run().catch((error: unknown) => {
  const reason = error instanceof Error ? error.message : String(error);
  process.stderr.write(`sdd-l error: ${reason}\n`);
  process.stderr.write(USAGE);
  process.exit(1);
});
