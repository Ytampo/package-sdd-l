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
sdd-l mentor
sdd-l teacher --feature-id auth-login
sdd-l coder --feature-id auth-login
```

オプション付き:

```bash
sdd-l mentor --runtime codex
sdd-l mentor --launch
sdd-l mentor --output-dir .sdd-l/generated
sdd-l coder --feature-id auth-login --launch
```

`--` 以降で codex のオプションを渡せます:

```bash
sdd-l mentor --launch -- --model gpt-5
```

## 挙動

- プロンプト合成順は固定です: `core -> role -> templates`
- 生成 instruction はデフォルトで `.sdd-l/generated/` に出力されます
- `coder` と `teacher` は `--feature-id` が必須で、ノートは `.sdd-l/notes/<feature-id>/` 配下に機能ごとに保存します
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
