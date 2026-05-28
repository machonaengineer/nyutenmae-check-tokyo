# SNS自動投稿 Runbook

## 方針

自動投稿は、承認済みキューに入った文面だけを公式APIへ送る。Xのパスワード、ブラウザCookie、内部GraphQL、画面操作の自動化は使わない。

## 実行条件

- `SNS_AUTO_POST_ENABLED=true` が設定されている。
- `X_USER_ACCESS_TOKEN` がサーバー側環境変数に設定されている。
- `SNS_AUTO_POST_QUEUE.csv` の対象行が `status=approved` である。
- 投稿本文に禁止表現、メールアドレス、非公開DBカラム名、証拠ファイルパスが含まれていない。
- 投稿先リンクが公開ページである。

## キュー列

- `date`: `YYYY-MM-DD`
- `slot`: `morning`、`noon`、`night` など
- `status`: `draft`、`approved`、`posted`、`blocked`
- `text`: 投稿本文
- `target_path`: `/reports/new` など公開ページへの導線
- `approved_by`: 承認者
- `posted_at`: 投稿後にスクリプトが記録する日時
- `post_url`: 投稿後にスクリプトが記録するURL
- `notes`: 運用メモ

## 実行方法

Dry-run:

```bash
npm run social:autopost -- --dry-run --date=2026-05-28 --slot=morning
```

本番投稿:

```bash
SNS_AUTO_POST_ENABLED=true npm run social:autopost -- --date=2026-05-28 --slot=morning
```

Windows PowerShell:

```powershell
$env:SNS_AUTO_POST_ENABLED="true"
npm run social:autopost -- --date=2026-05-28 --slot=morning
```

## 環境変数

- `SNS_AUTO_POST_ENABLED`: デフォルトは `false`。`true` の時だけ投稿する。
- `SNS_AUTO_POST_QUEUE_FILE`: 省略時は `SNS_AUTO_POST_QUEUE.csv`。
- `X_USER_ACCESS_TOKEN`: X APIのユーザー文脈アクセストークン。ブラウザへ出さない。
- `X_POST_PROFILE_USERNAME`: 投稿URLを記録するためのユーザー名。省略時は `nyutenmaecheck`。
- `X_API_BASE_URL`: 通常は未設定。テスト時だけ差し替える。

## 投稿前チェック

1. 個別店舗名や個人名が入っている場合は、公開ページURLへの案内に置き換える。
2. 外部口コミ、ニュース本文、SNS本文、スクリーンショットを転載していないことを確認する。
3. `reporter_email`、`private_note`、`storage_path`、`report-evidence-files` が入っていないことを確認する。
4. 証拠画像URL、投稿者メール、非公開メモが入っていないことを確認する。
5. 緊急時や身の危険に関わる内容は、投稿より相談導線を優先する。

## まだ自動化しないこと

- 自動いいね、自動フォロー、自動リポスト、自動返信。
- 個別店舗名を含むリプライへの公開議論。
- 画像付き投稿。画像を使う場合は、権利、個人情報、EXIF、出典確認の手順を別途追加する。
- X APIの利用枠や料金を超える運用。

## 参考

- X API Manage Posts: https://docs.x.com/x-api/posts/manage-tweets/introduction
- X API Integration guide: https://docs.x.com/x-api/posts/manage-tweets/integrate
- X API Getting Access: https://docs.x.com/x-api/getting-started/getting-access
