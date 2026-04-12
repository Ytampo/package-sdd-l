# Short Change Notes

## 変更概要

- `sdd-l <role>` で role を受け取り、prompt を合成して instruction ファイルを生成する最小 CLI を追加
- Compose / Runtime Adapter / File Output の責務を分けた初期構造を追加
- Codex 起動引数を `--instruction-file` 方式から、対話モード起動（`codex "<instruction text>"`）方式へ変更

## 変更理由

- AGENTS.md の MVP 着手条件として、まず CLI の最小動作を成立させる必要があったため
- 早い段階で責務分離の骨組みを作り、次の拡張（runtime 追加や launch 挙動改善）を安全にするため
- 現行 Codex CLI (`codex-cli 0.120.0`) では `--instruction-file` が非対応で起動失敗するため
- role 付き起動の体験として、`--launch` では非対話実行より対話画面を優先したかったため

## 注意点

- 現時点の runtime は `codex` のみ
- デフォルト挙動は「instruction 生成のみ」で、`--launch` 指定時のみ runtime を起動
- Codex CLI 側の引数仕様変更に備え、起動処理は `src/runtime/` に隔離している
- `--launch` 実行時に Codex 側の環境制約（権限・設定）で失敗する場合がある

## テスト観点

- 正常系:
  - `node src/cli/index.js mentor`
  - `node src/cli/index.js teacher`
  - `node src/cli/index.js coder`
  - それぞれ `.sdd-l/generated/` に instruction が出力されること
  - `core -> role -> template` 順で section が含まれること
- 異常系:
  - `node src/cli/index.js unknown-role` でエラー終了すること
