# SNS返信・情報提供案内 Runbook

## 方針

個別店舗名を含む投稿へ強い表現で反応しない。返信は、料金説明、会計内容、明細、相談先、非公開の情報提供フォームへの案内に限定する。

X公式APIのself-serve環境では、返信は原則として相手が対象アカウントを@メンション、または引用で明示的に呼んだ場合だけ許可される。任意の投稿へ無差別に返信する自動化は行わない。

## 実行条件

- `SNS_AUTO_REPLY_ENABLED=true` が設定されている。
- `X_USER_ACCESS_TOKEN` がサーバー側環境変数に設定されている。
- `SNS_REPLY_QUEUE.csv` の対象行が `status=approved` である。
- `summoned_account=yes` である。
- 返信本文に禁止表現、個人情報、証拠画像URL、非公開DBカラム名、外部本文転載が含まれていない。

## キュー列

- `discovered_at`: 発見日時
- `source_url`: 対象投稿URL。本文は転載しない。
- `tweet_id`: 返信先の投稿ID
- `author_handle`: 返信先のハンドル。確認用
- `summoned_account`: `yes` の場合だけ投稿対象
- `status`: `draft`、`approved`、`posted`、`blocked`
- `reply_text`: 返信本文
- `target_path`: `/reports/quick` など公開ページへの導線
- `approved_by`: 承認者
- `posted_at`: 投稿後にスクリプトが記録する日時
- `reply_url`: 投稿後にスクリプトが記録するURL
- `notes`: 運用メモ

## 安全文面テンプレート

```text
大変でしたね。料金説明・会計内容・明細の経緯があれば、非公開フォームから情報提供できます。連絡先や添付資料は公開ページに出ません。
```

```text
入店前の説明、会計金額、明細の有無などを後から確認できるよう、非公開フォームで情報提供を受け付けています。
```

```text
身の危険がある場合は安全確保を優先してください。相談先と保存しておきたい資料をこちらにまとめています。
```

## 実行方法

Dry-run:

```bash
npm run social:reply -- --dry-run --tweet-id=1234567890
```

本番返信:

```bash
SNS_AUTO_REPLY_ENABLED=true npm run social:reply -- --tweet-id=1234567890
```

Windows PowerShell:

```powershell
$env:SNS_AUTO_REPLY_ENABLED="true"
npm run social:reply -- --tweet-id=1234567890
```

## 返信しないケース

- 対象アカウントが@メンションまたは引用で呼ばれていない。
- 店舗名や個人名を含む公開議論が過熱している。
- 投稿本文のスクリーンショット、口コミ本文、ニュース本文を引用しないと文意が成立しない。
- 投稿者が返信を望んでいない、または削除・非公開にしている。
- 脅迫、個人攻撃、差別、犯罪断定が中心の投稿。

## 代替アクション

- 自分のタイムラインで、一般化した情報提供募集ポストを出す。
- `/reports/quick`、`/support`、`/guidelines` を定期投稿する。
- 対象投稿の本文は保存せず、URL、確認日、独自メモだけを審査キューへ残す。

## 参考

- X API Manage Posts: https://docs.x.com/x-api/posts/manage-tweets/introduction
- X API Getting Access: https://docs.x.com/x-api/getting-started/getting-access
