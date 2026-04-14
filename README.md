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

When installing into a project that has either `.git` or `.gitignore` (`npm install sdd-l`), postinstall asks whether to track `sdd-l-notes/` in git.
If you choose not to track it, `sdd-l-notes/` is added to `.gitignore`.

For non-interactive install, set:

```bash
SDDL_NOTES_GIT=track npm install sdd-l
SDDL_NOTES_GIT=ignore npm install sdd-l
```

## Usage

```bash
sdd-l mentor
sdd-l teacher
sdd-l coder
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
- `--feature` (`-f`) is optional and works as a context label for the run.
- Markdown note output is role-based:
  - Mentor: `sdd-l-notes/mentor/`
  - Coder: `sdd-l-notes/coder/`
  - Teacher: `sdd-l-notes/teacher/`
- Whether to create a new note file or update an existing one is decided by the agent based on context.
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
sdd-l-prompts/  # SDD-L prompt assets
```
