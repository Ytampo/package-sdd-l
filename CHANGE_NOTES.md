# Short Change Notes

## 変更概要

- 実装を JavaScript から TypeScript へ移行し、`dist/` ビルド成果物配布に変更
- `tsconfig.json`、`build/typecheck/prepublishOnly` を追加して公開前に型検証できる構成へ変更
- `--output-dir` の書き込み先を作業ディレクトリ配下に制限
- Codex passthrough 引数を許可リスト方式にし、危険フラグや未知フラグを拒否
- Launch command 表示から `$(cat ...)` を除去し、シェル展開依存を廃止
- 生成 instruction 先頭に「起動直後は待機し、探索を開始しない」ルールを追加
- 起動時に現在ロールを把握しやすくするため、`[SDD-L] role=... runtime=... mode=...` バナーを追加
- 生成 instruction に「最初の返答を `READY: role=... runtime=...` で固定する」ルールを追加
- `coder` / `teacher` のテンプレ運用を「回答出力」ではなく「`.md` ファイル生成」に明確化
- ノート出力先を role 固定ディレクトリへ変更（`.sdd-l/notes/mentor|coder|teacher/`）
- `--feature` は任意コンテキストラベル化（`--feature-id` は互換エイリアス）
- runtime launch をデフォルト有効化し、生成のみモードは `--no-launch` に変更
- 機能単位の新規ノート作成/既存更新はエージェント判断へ委譲
- `prompts/` を廃止し、`sdd-l-prompts/` に一本化（後方互換フォールバック読込も削除）

## 変更理由

- 型安全性と保守性を上げ、公開後の変更コストを下げるため
- npm 公開時に不要ファイルを含めず、実行に必要な成果物のみ配布するため
- 入力値由来の安全性を上げるため（出力先制約・runtime オプション制限）
- launch 時に不要な先行探索を抑え、ユーザー指示起点で動かすため
- 起動直後にどのロールで動いているかをユーザーが即認識できるようにするため
- Change Notes / Teaching Note を会話ログではなく再利用可能な文書資産として残すため
- role ごとの作業履歴を分離し、起動オプションの運用負荷を下げるため
- 実行コマンドの入力負荷を下げ、日常運用を簡潔にするため

## 注意点

- 現時点の runtime は `codex` のみ
- 開発時は `npm run build` 実行後に `dist/` を使って CLI を起動する
- `--launch` 実行時に Codex 側の環境制約（権限・設定）で失敗する場合がある
- passthrough は codex オプションのみ許可し、`--dangerously-bypass-approvals-and-sandbox` は拒否する
- 起動直後の待機挙動は instruction 依存のため、Codex 側挙動変更時は再調整が必要
- `teacher` の Teaching Note は Note 出力が必要な場合のみ `.sdd-l/notes/teacher/` 配下で作成を求める
- `--feature` は任意。使う場合は英数字・`.`・`_`・`-` のみ許可する
- 旧 `prompts/` は非対応（破壊的変更）

## テスト観点

- 正常系:
  - `npm run build`
  - `node dist/cli/index.js mentor`
  - `node dist/cli/index.js teacher`
  - `node dist/cli/index.js coder`
  - それぞれ `.sdd-l/generated/` に instruction が出力されること
  - `core -> role -> template` 順で section が含まれること
  - `npm pack --dry-run` で `dist/` と `sdd-l-prompts/` のみ含まれること
- 異常系:
  - `node dist/cli/index.js unknown-role` でエラー終了すること
  - `node dist/cli/index.js mentor --output-dir ../outside` で拒否されること
  - `node dist/cli/index.js mentor -- --bogus-flag` で拒否されること
