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
- [ ] `0008_report_source_attribution.sql` を本番DBへ適用した。
- [ ] `0009_building_level_place_tracking.sql` を本番DBへ適用した。
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
- [ ] 公的情報、報道、外部傾向をもとに公開候補を作る場合、`source_type`、`source_url`、`source_title`、`source_checked_at` が保存されていることを確認した。
- [ ] 出典付き公開候補を承認する前に、公開サマリーが独自要約であり、外部本文、口コミ本文、画像、スクリーンショットを転載していないことを確認した。
- [ ] 出典付き公開候補を承認する前に、`source_title` と `public_summary` に禁止表現、個人情報、非公開DBカラム名が含まれていないことを確認した。
- [ ] Google Places API同期を使う場合、`GOOGLE_PLACES_API_KEY` がVercelのサーバー環境変数だけに設定され、`NEXT_PUBLIC_` が付いていないことを確認した。
- [ ] 食べログなど規約確認が必要な外部評価は、許諾確認まで `display_allowed=false` のまま公開されないことを確認した。
- [ ] `NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED` は必要な場合だけ `true` にし、無料枠とプライバシー表示を確認した。
- [ ] `NEXT_PUBLIC_MONETIZATION_ENABLED` は収益化開始前は `false` のままにした。
- [ ] AdSense所有権確認だけを行う場合、`NEXT_PUBLIC_ADSENSE_VERIFICATION_ENABLED=true`、`NEXT_PUBLIC_ADSENSE_ENABLED=false`、ad slot未設定で再デプロイした。
- [ ] AdSenseを使う場合、`NEXT_PUBLIC_ADSENSE_ENABLED` は審査、ads.txt、広告配置確認が完了するまで `false` のままにした。
- [ ] AdSenseを使う場合、`ADS_TXT_GOOGLE_PUBLISHER_ID` を設定し、`/ads.txt` が `google.com, pub-..., DIRECT, f08c47fec0942fa0` を返すことを確認した。
- [ ] AdSenseを使う場合、`NEXT_PUBLIC_ADSENSE_CLIENT` は `ca-pub-...` 形式、ad slot IDは数字のみで設定した。
- [ ] AdSenseを使う場合、広告クリックを促す文言、誤クリックを誘導する配置、コンテンツと誤認させる見出しがないことを確認した。
- [ ] SNS共有文と `/admin/social` のテンプレートに断定表現、個人情報、外部本文転載は禁止が含まれていないことを確認した。
- [ ] `/sources` と `/admin/research` に掲載する公式ソースURL、確認日、要約が最新で、本文転載は禁止していないことを確認した。
- [ ] `/sources` と `/admin/research` に掲載する報道・公的情報ソースは、出典URL、確認日、独自要約として扱い、記事本文や口コミ本文をコピーしていないことを確認した。
- [ ] `/coverage` に表示される情報蓄積状況が、未承認投稿や個別店舗の断定表示になっていないことを確認した。
- [ ] `INITIAL_DATA_REVIEW_QUEUE.csv` に沿って、候補ごとの出典確認、現在状況、建物情報、公開可否を人間が確認した。
- [ ] `/admin/data` の候補一括投入を使った場合、作成された投稿が `needs_review`、`evidence_level=Hidden`、投稿者メールが内部seed用メールで保存されることを確認した。
- [ ] SNSプロフィールURLを設定する場合、`NEXT_PUBLIC_X_PROFILE_URL` など公開してよいURLだけを入れ、ログイン情報やトークンを入れていないことを確認した。
- [ ] スポンサー問い合わせフォームの送信内容が公開ページに表示されず、管理者画面だけで確認できることを確認した。
- [ ] `/llms.txt` と構造化データに、投稿者メールアドレス、非公開メモ、証拠画像URL、Storageパス、外部口コミ本文が含まれていないことを確認した。
- [ ] 収益化枠をONにする前に、Vercel/Supabase/広告サービスの商用利用条件、Cookie/プライバシー表示、法務文面を確認した。
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
- [ ] `/social` が表示され、共有ボタンと注意文が確認できる。
- [ ] `/sources` が表示され、公式ソースと転載禁止方針が確認できる。
- [ ] `/coverage` が表示され、エリア別の蓄積状況と非公開方針が確認できる。
- [ ] `/sponsor` で非公開問い合わせフォームが表示される。
- [ ] `/monetization-policy` が表示され、掲載独立性の方針が確認できる。
- [ ] `/ads.txt` が未設定時は設定漏れコメント、AdSense設定後はGoogle向けads.txt行を返す。
- [ ] 管理者でログイン後、投稿の承認、非公開、差し戻し、却下ができる。
- [ ] 管理者でログイン後、`/admin` の概況と `/admin/data` のCSV検証、非公開デフォルト投入画面が表示される。
- [ ] `/admin/data` から初期データを投入した場合、`reports.status` は `pending` または `needs_review`、`evidence_level` は `Hidden` のまま保存される。
- [ ] 証拠画像は管理画面だけで短時間の署名付きURLとして表示される。
- [ ] 管理者でログイン後、外部評価スナップショットの追加ができ、公開ページでは集計値、出典URL、確認日だけが表示される。
- [ ] 管理者でログイン後、`/admin/social` のSNS文面テンプレートを確認できる。
- [ ] 管理者でログイン後、`/admin/research` の調査キューを確認できる。
- [ ] 管理者でログイン後、`/admin/sponsors` の問い合わせ一覧を確認できる。
- [ ] 管理者でログイン後、`/admin/quality` で建物情報不足、出典確認待ち、未対応異議、同一住所・同一建物候補を確認できる。
- [ ] `/roadmap` が表示され、フェーズ13〜20と公開情報の扱い方が確認できる。
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
- 収益化を開始する場合のホスティングプラン、広告ポリシー、Cookie/プライバシー表示、法務レビュー
