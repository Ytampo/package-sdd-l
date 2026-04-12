export const SUPPORTED_RUNTIMES = ["codex"] as const;
export type Runtime = (typeof SUPPORTED_RUNTIMES)[number];
export const DEFAULT_RUNTIME: Runtime = "codex";

export function isSupportedRuntime(value: string): value is Runtime {
  return (SUPPORTED_RUNTIMES as readonly string[]).includes(value);
}
