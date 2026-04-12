export const SUPPORTED_RUNTIMES = Object.freeze(["codex"]);
export const DEFAULT_RUNTIME = "codex";

export function isSupportedRuntime(value) {
  return SUPPORTED_RUNTIMES.includes(value);
}
