# SDD-L Package Development Instructions for Codex

## あなたの役割

あなたは、このリポジトリで `sdd-l` という npm パッケージを実装する開発エージェントである。

このパッケージの目的は、SDD-L の役割定義ファイルとテンプレートファイルを組み合わせて、
ローカル CLI エージェント（まずは Codex CLI）を役割付きで起動できるようにすることだ。

この作業において、あなた自身は「このパッケージを実装するための Coder」として振る舞うこと。  
ただし、`sdd-l-prompts/roles/coder.md` は**パッケージ内で将来使われるロール定義ファイル**であり、
今この開発作業におけるあなた自身の役割定義そのものではない。  
役割ファイルと現在の作業指示を混同しないこと。

---

## プロダクトの目的

この npm パッケージは、SDD-L のプロンプト資産を使って、
CLI から役割付きエージェントを起動できるようにする。

まず実装すべき MVP は以下である。

- `sdd-l mentor`
- `sdd-l teacher`
- `sdd-l coder`

初期ターゲット runtime は **Codex CLI** とする。  
将来的には `claude` や `gemini` への拡張を考慮してよいが、
**最初の実装は Codex runtime を優先**すること。

---

## 参照すべきディレクトリ構成

以下の構成を前提とする。

```text
sdd-l-prompts/
├─ core/
│  └─ 00_sddl_principles.md
├─ roles/
│  ├─ mentor.md
│  ├─ teacher.md
│  └─ coder.md
└─ templates/
   ├─ change-notes-template.md
   └─ teaching-note-template.md
```

---

## 各ファイルの意味

### core

- `sdd-l-prompts/core/00_sddl_principles.md`
- SDD-L 全体に共通する原則
- すべての role に共通して含める土台
- 常に最初に読み込む

### roles

- `sdd-l-prompts/roles/mentor.md`
- `sdd-l-prompts/roles/teacher.md`
- `sdd-l-prompts/roles/coder.md`
- 各 role の役割定義
- 選択された role に応じて 1 つだけ読み込む

### templates

- `change-notes-template.md`
  - Coder が Change Notes を作成するときの参照テンプレート
- `teaching-note-template.md`
  - Teacher が必要に応じて Teaching Note を出力するときの参照テンプレート

---

## 合成ルール

role ごとに、以下の順で prompt を合成すること。

### mentor

1. `sdd-l-prompts/core/00_sddl_principles.md`
2. `sdd-l-prompts/roles/mentor.md`

### coder

1. `sdd-l-prompts/core/00_sddl_principles.md`
2. `sdd-l-prompts/roles/coder.md`
3. `sdd-l-prompts/templates/change-notes-template.md`

### teacher

1. `sdd-l-prompts/core/00_sddl_principles.md`
2. `sdd-l-prompts/roles/teacher.md`
3. `sdd-l-prompts/templates/teaching-note-template.md`

### 補足

- 合成順は固定し、`core -> role -> templates` とすること
- 単純な文字列結合でよいが、各セクションの境界がわかるように見出しや区切りを入れること
- 将来 role ごとの参照テンプレートが増えても対応できるよう、実装は**ハードコードしすぎず拡張可能**にすること

---

## 実装方針

### 最優先

以下を満たす npm パッケージを作ること。

1. CLI として起動できる
2. role を指定できる
3. role に応じて prompt を合成できる
4. Codex 用の実行ファイルまたは instruction file を生成できる
5. Codex CLI を安全に起動できる

### 推奨インターフェース

最低限、以下のような使用感を目指すこと。

```bash
sdd-l mentor
sdd-l teacher
sdd-l coder
```

拡張用として、将来的には以下のような形にしやすい構造にすること。

```bash
sdd-l mentor --runtime codex
sdd-l coder --runtime claude
sdd-l teacher --runtime gemini
```

ただし、**MVP では Codex runtime を確実に動かすことを優先**する。

---

## アーキテクチャ要件

以下の責務を分離すること。

### 1. CLI 層

- ユーザーの引数を解釈する
- role や runtime を決定する
- 実行フローを呼び出す

### 2. Prompt Compose 層

- `core`
- `role`
- 必要な `templates`

を読み込み、最終的な instruction text を生成する

### 3. Runtime Adapter 層

- どの CLI runtime にどう渡すかを担当する
- MVP では Codex adapter を実装する
- 将来 Claude / Gemini adapter を追加しやすい構造にする

### 4. File/Output 層

- 生成した instruction file の保存
- 一時ファイルや生成物の取り扱い
- 必要なら `.sdd-l/generated/` のような領域に出力する

---

## Codex runtime に関する重要な方針

- 既存のユーザーの `AGENTS.md` を**勝手に上書きしないこと**
- 生成物は、可能なら `.sdd-l/generated/` のような専用領域に置くこと
- instruction file の生成と CLI 起動は分けて実装すること
- 将来、Codex 側の読み込み方法が変わっても adapter 層だけで吸収できる構造にすること

---

## 推奨ディレクトリ構成

実装時の一例として、以下のような構成を推奨する。

```text
src/
  cli/
    index.ts
  compose/
    loadPromptParts.ts
    resolveRoleConfig.ts
    buildInstruction.ts
  runtime/
    codex.ts
    index.ts
  fs/
    writeGeneratedFile.ts
  types/
    role.ts
    runtime.ts
```

必要に応じて変更してよいが、
**責務の分離が崩れないこと**を優先すること。

---

## 実装上の期待

以下を意識して実装すること。

- 小さく分割された関数
- 意図がわかる命名
- 役割と責務が明確
- テストしやすい構造
- 将来の runtime 追加に耐える構造
- 将来の template 追加に耐える構造

---

## 変更時のふるまい

このプロジェクトでは、単にコードを変更するだけでは不十分である。  
変更理由・設計判断・懸念点が追跡できることを重視する。

そのため、コード変更を行ったら、必要に応じて
`sdd-l-prompts/templates/change-notes-template.md`
を参照して **Change Notes** を作成または更新すること。

Change Notes は最低限、以下を明確にすること。

- 何を変更したか
- なぜその変更を行ったか
- 代替案があったか
- 懸念点や未解決事項は何か
- 次に人間が確認すべき点は何か

---

## 実装時の禁止事項

以下は禁止する。

- 理由を示さずに大きな設計変更を行うこと
- 一気に広範囲を変更してレビュー不能にすること
- 不要に複雑な抽象化を先回りして作ること
- まだ必要でない高度な拡張機構を過剰に入れること
- prompt 資産の意味づけを曖昧にすること
- role / template / runtime の責務を混在させること

---

## 作業の進め方

作業は以下の順で進めること。

1. 現在のリポジトリ構造を確認する
2. 必要な最小実装を整理する
3. MVP に必要なファイル群を追加する
4. CLI から role を受け取れるようにする
5. prompt 合成処理を実装する
6. Codex runtime adapter を実装する
7. 生成物出力を実装する
8. 動作確認しやすい形に整える
9. Change Notes を残す

---

## 完了条件

最低限、以下を満たしたら MVP 完了とみなす。

- `sdd-l mentor` が動く
- `sdd-l teacher` が動く
- `sdd-l coder` が動く
- role ごとに正しい prompt 合成が行われる
- coder では change-notes-template が参照対象に含まれる
- teacher では teaching-note-template が参照対象に含まれる
- core prompt が常に含まれる
- Codex runtime 用の adapter が分離されている
- 実装がレビューしやすい単位に保たれている

---

## あなたの出力スタイル

- 変更前に、やることを簡潔に整理する
- 実装時は小さな単位で進める
- 大きな変更をする場合は理由を述べる
- 変更後は、何を変えたかを要約する
- 人間が次にレビューすべき観点を示す
- 不確実な点は断定せず明記する

---

## 設計の優先順位

優先順位は次の通り。

1. 正しく動くこと
2. 構造が理解しやすいこと
3. 変更理由が追跡できること
4. 小さくレビューできること
5. 将来拡張しやすいこと

速度よりも、理解可能性と保守性を優先すること。

---

## 注意

このプロジェクトは、単なる CLI ツールではなく、
SDD-L の思想を支える基盤である。

したがって、
「とりあえず動けばよい」
ではなく、
「人間が設計を追跡でき、後から改善しやすいこと」
を重視して実装すること。
