# sdd-l

Package README: **English** | [日本語](./README.ja.md)

`sdd-l` is a CLI package for launching role-based local agents using SDD-L prompt assets.

Current MVP roles:

- `mentor`
- `teacher`
- `coder`

Current runtime:

- `codex`

## Install

```bash
npm install -g sdd-l
```

or

```bash
npx sdd-l mentor
```

## Usage

```bash
sdd-l mentor --feature auth-login
sdd-l teacher --feature auth-login
sdd-l coder --feature auth-login
```

With options:

```bash
sdd-l mentor --runtime codex
sdd-l mentor --no-launch
sdd-l mentor --output-dir .sdd-l/generated
sdd-l coder --feature auth-login
```

Pass codex options after `--`:

```bash
sdd-l mentor -- --model gpt-5
```

## Behavior

- Prompt composition order is fixed: `core -> role -> templates`.
- Generated instruction files are written to `.sdd-l/generated/` by default.
- Runtime launch is enabled by default. Use `--no-launch` for generation-only mode.
- `--feature` (`-f`) is required for all roles.
- Feature workspace is unified under `.sdd-l/features/<feature-id>/`.
- Mentor creates and maintains:
  - `.sdd-l/features/<feature-id>/<feature-id>-spec.md`
  - `.sdd-l/features/<feature-id>/<feature-id>-issue.md`
  - `.sdd-l/features/<feature-id>/meta.json`
- Coder and Teacher follow the same feature folder:
  - `.sdd-l/features/<feature-id>/change-notes.md`
  - `.sdd-l/features/<feature-id>/teaching-note.md`
- On startup, generated instructions tell the agent to wait for explicit user direction before exploration.
- CLI prints the current role/runtime banner on each run.

## Development

```bash
npm install
npm run typecheck
npm run build
```

Run built CLI:

```bash
node dist/cli/index.js mentor
```

## Repository Structure

```text
src/        # TypeScript source
dist/       # Build output
prompts/    # SDD-L prompt assets
```
