# 本番公開前チェックリスト

本チェックリストは「入店前チェック東京」をMVPとして公開する前の最終確認項目です。チェックが完了していない項目がある場合は、本番公開を延期してください。

## 必須チェック

- [ ] Supabase本番プロジェクトを作成した。
- [ ] `0001_initial_schema.sql` を本番DBへ適用した。
- [ ] `0002_public_map_detail_views.sql` を本番DBへ適用した。
- [ ] `0003_mvp_release_hardening.sql` を本番DBへ適用した。
- [ ] `0004_submission_hardening.sql` を本番DBへ適用した。
- [ ] `0005_browser_rate_limit_key.sql` を本番DBへ適用した。
- [ ] `0006_service_role_privileges.sql` を本番DBへ適用した。
- [ ] `0007_external_rating_snapshots.sql` を本番DBへ適用した。
- [ ] `supabase/verification/non_admin_visibility_checks.sql` を実行し、期待値を確認した。
- [ ] `report-evidence-files` bucket が private であることをSupabase画面でも確認した。
- [ ] `reports`, `report_evidence_files`, `objections`, `admin_actions` を匿名ユーザーが直接読めないことを確認した。
- [ ] 公開ビューに `reporter_email`, `private_note`, 証拠ファイルパスが含まれていないことを確認した。
- [ ] 投稿フォーム送信後の `reports.status` が `pending`、`evidence_level` が `Hidden` であることを確認した。
- [ ] 管理者が承認した投稿だけが `/map`, `/areas`, `/places/[id]` に表示されることを確認した。
- [ ] 管理画面に `ADMIN_EMAILS` 設定済みメールだけが入れることを確認した。
- [ ] Service Role Key がVercelのサーバー環境変数だけに設定され、`NEXT_PUBLIC_` が付いていないことを確認した。
- [ ] `service_role` がServer Actionに必要なDB権限を持ち、anon/authenticatedに非公開テーブルの直接読み取り権限がないことを確認した。
- [ ] `RATE_LIMIT_SECRET` がVercelのサーバー環境変数に設定されていることを確認した。
- [ ] `.next/static` にService Role関連文字列が混入していないことを確認した。
- [ ] 投稿フォームと異議申立てフォームにhoneypot項目があり、通常利用者には表示されないことを確認した。
- [ ] 同一IP、同一メールアドレス、同一ブラウザ相当からの短時間連投が制限されることをPreviewで確認した。
- [ ] 投稿または異議申立て送信後、HTTP-only Cookie `nt_submission_client_id` が発行されることをPreviewで確認した。
- [ ] 証拠画像は許可拡張子、MIME type、ファイル内容が一致しない場合に保存されないことを確認した。
- [ ] 証拠画像のStorage保存名がUUIDベースで、元ファイル名を使っていないことを確認した。
- [ ] `/healthz` が `{"status":"ok"}` を返し、監視用URLとして利用できることを確認した。
- [ ] `/admin`, `/reports/thanks`, `/healthz` に `X-Robots-Tag: noindex` が付くことを確認した。
- [ ] JPEG、PNG、WebPのメタデータ削除を確認し、HEIC/HEIFは公開前に手動で個人情報を確認した。
- [ ] 外部評価参考値を使う場合、`public_external_rating_snapshots` に `private_memo`、外部口コミ本文、投稿者名、スクリーンショットURLが含まれないことを確認した。
- [ ] Google Places API同期を使う場合、`GOOGLE_PLACES_API_KEY` がVercelのサーバー環境変数だけに設定され、`NEXT_PUBLIC_` が付いていないことを確認した。
- [ ] 食べログなど規約確認が必要な外部評価は、許諾確認まで `display_allowed=false` のまま公開されないことを確認した。
- [ ] `NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED` は必要な場合だけ `true` にし、無料枠とプライバシー表示を確認した。
- [ ] `NEXT_PUBLIC_MONETIZATION_ENABLED` は収益化開始前は `false` のままにした。
- [ ] 収益化枠をONにする前に、Vercel/Supabase/広告サービスの商用利用条件と法務文面を確認した。
- [ ] 禁止表現が公開UIに表示されていないことを確認した。
- [ ] 利用規約、プライバシーポリシー、投稿ガイドラインを人間が確認した。
- [ ] トラブル時の相談導線ページの電話番号とリンクを確認した。

## コマンド確認

```bash
npm run lint
npm run typecheck
npm run build
npx playwright test
npm audit --audit-level=moderate
```

## 公開直前の手動確認

- [ ] `/` の公開方針が正しい。
- [ ] `/reports/new` で証拠画像とメールアドレスが一般公開されない旨が表示されている。
- [ ] `/objection` で異議申立てフォームが表示される。
- [ ] `/admin/reports` は未ログイン時にログイン画面へ誘導される。
- [ ] `/checklists` と `/areas/shinjuku-kabukicho/checklist` が表示される。
- [ ] 管理者でログイン後、投稿の承認、非公開、差し戻し、却下ができる。
- [ ] 証拠画像は管理画面だけで短時間の署名付きURLとして表示される。
- [ ] 管理者でログイン後、外部評価スナップショットの追加ができ、公開ページでは集計値、出典URL、確認日だけが表示される。
- [ ] スマホ幅で横スクロールやボタン欠けがない。

## 公開判断

次のいずれかが未完了の場合、本番公開しないでください。

- RLS/Storage検証
- 管理者ログイン検証
- 投稿非公開デフォルト検証
- 法務文面確認
- Service Role Key露出確認
- rate limit / ブラウザ識別Cookie / honeypot確認
- 外部評価を公開する場合の規約、帰属表示、転載禁止確認
- 収益化を開始する場合のホスティングプラン、広告ポリシー、法務レビュー
