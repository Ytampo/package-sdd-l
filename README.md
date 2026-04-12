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
sdd-l mentor
sdd-l teacher --feature-id auth-login
sdd-l coder --feature-id auth-login
```

With options:

```bash
sdd-l mentor --runtime codex
sdd-l mentor --launch
sdd-l mentor --output-dir .sdd-l/generated
sdd-l coder --feature-id auth-login --launch
```

Pass codex options after `--`:

```bash
sdd-l mentor --launch -- --model gpt-5
```

## Behavior

- Prompt composition order is fixed: `core -> role -> templates`.
- Generated instruction files are written to `.sdd-l/generated/` by default.
- For `coder` and `teacher`, `--feature-id` is required and notes are written per feature under `.sdd-l/notes/<feature-id>/`.
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
