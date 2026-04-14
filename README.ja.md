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

`.git` または `.gitignore` があるプロジェクトで `npm install sdd-l` した場合、postinstall で `sdd-l-notes/` を git 追跡するか確認します。
追跡しない選択をした場合は `.gitignore` に `sdd-l-notes/` を追記します。

非対話環境では、次の環境変数で指定できます:

```bash
SDDL_NOTES_GIT=track npm install sdd-l
SDDL_NOTES_GIT=ignore npm install sdd-l
```

## 使い方

```bash
sdd-l mentor
sdd-l teacher
sdd-l coder
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
- `--feature`（`-f`）は任意で、実行時のコンテキストラベルとして使えます
- md ノートの出力先は role ごとに固定です
  - Mentor: `sdd-l-notes/mentor/`
  - Coder: `sdd-l-notes/coder/`
  - Teacher: `sdd-l-notes/teacher/`
- 新規作成か既存更新かは、実行コンテキストを見てエージェント側で判断します
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
sdd-l-prompts/  # SDD-L prompt assets
```
