# SNS連携・拡散運用メモ

## 方針

SNSは、入店前確認、相談導線、情報提供募集の入口として使う。自動投稿は公式API、承認済みキュー、デフォルトOFFを前提にし、パスワードやブラウザCookieを使った投稿自動化は行わない。

## 実装済み

- `/social`: SNS共有と情報提供導線
- `/admin/social`: 管理者向けSNS文面テンプレート
- 公開ページの共有ボタン、URLコピー、X/LINE/Facebook共有リンク
- Open Graph画像生成
- Twitter Cardを `summary_large_image` に設定
- SNSプロフィールURLの環境変数差し込み
- `SOCIAL_CONTENT_CALENDAR.csv`: 初週のX投稿カレンダー
- `SNS_OPERATIONS_SOP.md`: SNS投稿、返信、禁止事項の運用手順
- `SNS_AUTO_POSTING_RUNBOOK.md`: 公式APIを使う自動投稿の承認キュー運用
- `SNS_AUTO_POST_QUEUE.csv`: `approved` の行だけを投稿対象にするキュー

## 運用ルール

1. 証拠画像、投稿者メールアドレス、非公開メモをSNSに載せない。
2. 外部口コミ本文、ニュース本文、SNS投稿本文、スクリーンショットを転載しない。
3. 個別店舗や個人への断定、攻撃、煽り表現を避ける。
4. 個別報告を紹介する場合は、承認済み公開ページのURLだけを共有する。
5. 身の危険があるケースではSNS投稿ではなく、安全確保と相談導線を優先する。

## 将来の自動連携候補

- SNS予約投稿ツールへの手動コピー運用
- Google SheetsやNotionでSNS投稿カレンダーを管理
- X API、Instagram Graph APIなどの公式API連携

公式API連携を行う場合は、アクセストークンをVercelのサーバー環境変数に置き、投稿前の管理者承認、操作ログ、失敗時の再送制御を必ず行う。現時点の実装は `scripts/social-autopost.mjs` のdry-runで文面を検証し、`SNS_AUTO_POST_ENABLED=true` の時だけ投稿する。
