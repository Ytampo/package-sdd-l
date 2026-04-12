# sdd-l

Package README: [English](./README.md) | **日本語**

`sdd-l` は、SDD-L のプロンプト資産を使って、ロール付きローカルエージェントを起動するための CLI パッケージです。

現在の MVP ロール:

- `mentor`
- `teacher`
- `coder`

現在の runtime:

- `codex`

## インストール

```bash
npm install -g sdd-l
```

または

```bash
npx sdd-l mentor
```

## 使い方

```bash
sdd-l mentor --feature auth-login
sdd-l teacher --feature auth-login
sdd-l coder --feature auth-login
```

オプション付き:

```bash
sdd-l mentor --runtime codex
sdd-l mentor --no-launch
sdd-l mentor --output-dir .sdd-l/generated
sdd-l coder --feature auth-login
```

`--` 以降で codex のオプションを渡せます:

```bash
sdd-l mentor -- --model gpt-5
```

## 挙動

- プロンプト合成順は固定です: `core -> role -> templates`
- 生成 instruction はデフォルトで `.sdd-l/generated/` に出力されます
- runtime 起動はデフォルトで有効です。生成だけ行う場合は `--no-launch` を使います
- 全ロールで `--feature`（`-f`）が必須です
- 機能単位の作業領域は `.sdd-l/features/<feature-id>/` に統一されます
- Mentor は以下を作成・更新します
  - `.sdd-l/features/<feature-id>/<feature-id>-spec.md`
  - `.sdd-l/features/<feature-id>/<feature-id>-issue.md`
  - `.sdd-l/features/<feature-id>/meta.json`
- Coder / Teacher は同じ機能フォルダ内で以下を作成・更新します
  - `.sdd-l/features/<feature-id>/change-notes.md`
  - `.sdd-l/features/<feature-id>/teaching-note.md`
- 起動時の instruction では、明示指示があるまで探索しないように誘導します
- 実行時には role/runtime バナーを表示します

## 開発

```bash
npm install
npm run typecheck
npm run build
```

ビルド済み CLI の実行:

```bash
node dist/cli/index.js mentor
```

## リポジトリ構成

```text
src/        # TypeScript source
dist/       # Build output
prompts/    # SDD-L prompt assets
```
