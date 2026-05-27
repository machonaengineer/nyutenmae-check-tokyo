# MVPリリース計画

## 目的

「入店前チェック東京」を、本番公開に耐える最小構成でリリースする。公開対象は、管理者が承認した注意報告と、入店前確認に必要な地図、エリア、詳細、相談導線に限定する。

## リリース範囲

- 公開ページ
  - `/`
  - `/map`
  - `/areas`
  - `/areas/[slug]`
  - `/places/[id]`
  - `/reports/new`
  - `/reports/thanks`
  - `/objection`
  - `/guidelines`
  - `/support`
  - `/terms`
  - `/privacy`
- 管理ページ
  - `/admin`
  - `/admin/reports`
  - `/admin/reports/[id]`
  - `/admin/objections`
- Supabase
  - PostgreSQL tables
  - RLS policies
  - private Storage bucket
  - public safe views

## リリースしない範囲

- 自動公開
- 星評価
- 味や通常接客の評価
- 証拠画像の一般公開
- 投稿者メールアドレスの一般公開
- 外部口コミ本文やニュース本文の転載は禁止
- 外部サービスの星評価を本サービス内の評価として扱うこと
- 許諾確認前の食べログ等の外部評価公開
- 法務・規約確認前の広告、スポンサー、支援リンク表示

## リリース手順

1. Supabase本番プロジェクトを作成する。
2. `supabase/migrations/0001_initial_schema.sql` を適用する。
3. `supabase/migrations/0002_public_map_detail_views.sql` を適用する。
4. `supabase/migrations/0003_mvp_release_hardening.sql` を適用する。
5. `supabase/migrations/0004_submission_hardening.sql` を適用する。
6. `supabase/migrations/0005_browser_rate_limit_key.sql` を適用する。
7. `supabase/migrations/0006_service_role_privileges.sql` を適用する。
8. `supabase/migrations/0007_external_rating_snapshots.sql` を適用する。
9. `supabase/migrations/0008_report_source_attribution.sql` を適用する。
10. `supabase/verification/non_admin_visibility_checks.sql` を実行して結果を記録する。
11. Supabase Authで管理者ユーザーを作成する。
12. Vercelに環境変数を設定する。
13. Vercel Previewで `npm run build` 相当の成功を確認する。
14. Previewで投稿、異議申立て、rate limit、ブラウザ識別Cookie、honeypot、管理画面、承認、公開表示を確認する。
15. 外部評価を使う場合は、`EXTERNAL_RATING_GUIDE.md` に沿って出典URL、確認日、規約、帰属表示を確認する。
16. 報道や公的情報を公開候補にする場合は、`source_type`、出典URL、確認日、独自要約、転載禁止を確認する。
17. 収益化枠は初期値OFFにし、`FREE_TIER_GROWTH_PLAN.md` に沿って商用利用条件を確認する。
18. `LAUNCH_CHECKLIST.md` の必須項目をすべて確認する。
19. Production Deployを実行する。
20. 本番URLで公開ページ、投稿、管理ログイン、Storage private設定を再確認する。

## ロールバック方針

- Vercelの直前デプロイへ戻す。
- 問題のある公開投稿は管理画面で `hidden` に変更する。
- Storage bucket が公開化していた場合は直ちに private に戻し、署名付きURLの露出範囲を確認する。
- Service Role Keyの漏えいが疑われる場合はSupabaseでキーを再発行し、Vercel環境変数を更新する。

## リリース判定基準

- 投稿が `pending` / `Hidden` で保存される。
- 承認済み投稿だけが地図、エリア、詳細に表示される。
- 公開ビューにメールアドレス、非公開メモ、証拠ファイルパスが含まれない。
- 外部評価参考値の公開ビューに口コミ本文、投稿者名、非公開メモ、スクリーンショットURLが含まれない。
- 出典付き公開候補は、承認済み投稿だけが出典URL、確認日、独自要約として表示される。
- 収益化枠がデフォルトOFFで、ONにしても投稿審査や公開順位に影響しない。
- 管理画面が `ADMIN_EMAILS` で制限される。
- `npx playwright test` が成功する。
- 人間による法務/表現確認が完了している。
