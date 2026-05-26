# 入店前チェック東京

キャッチについて行く前に見る、都内繁華街の注意マップ。

## 概要

都内繁華街における、客引き経由の来店、料金説明と会計内容の不一致、明細提示、会計時対応、退店時対応などの報告を、証拠レベル付きで蓄積・検索・地図表示するMVPです。

このサービスは飲食店の味や通常接客を評価する口コミサイトではありません。投稿者の申告に基づく注意情報として扱い、管理者承認前の投稿は公開しません。

## セットアップ

```bash
npm install
cp .env.example .env.local
npm run dev
```

ローカルURL:

```text
http://localhost:3000
```

## 主なコマンド

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test:e2e
```

## Supabaseセットアップ

1. Supabaseプロジェクトを作成する
2. `supabase/migrations/0001_initial_schema.sql` をSQL Editorで実行する
3. `supabase/migrations/0002_public_map_detail_views.sql` をSQL Editorで実行する
4. `supabase/migrations/0003_mvp_release_hardening.sql` をSQL Editorで実行する
5. `supabase/migrations/0004_submission_hardening.sql` をSQL Editorで実行する
6. `supabase/migrations/0005_browser_rate_limit_key.sql` をSQL Editorで実行する
7. `supabase/migrations/0006_service_role_privileges.sql` をSQL Editorで実行する
8. `supabase/migrations/0007_external_rating_snapshots.sql` をSQL Editorで実行する
9. `.env.local` にSupabaseの値を設定する
10. 管理者ユーザーをSupabase Authで作成する
11. 管理者メールを `profiles` でadminに更新する

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

確認用SQL:

```text
supabase/verification/non_admin_visibility_checks.sql
```

この確認SQLでは、匿名ユーザーと通常ログインユーザーが `reports` を直接読めないこと、公開ビュー `public_reports` には承認済み投稿だけが出ることを確認します。

## 管理者設定

`.env.local` の `ADMIN_EMAILS` に管理者メールアドレスをカンマ区切りで設定します。

```bash
ADMIN_EMAILS=admin@example.com,manager@example.com
```

Supabase Authで同じメールアドレスのユーザーを作成し、パスワードログインを有効にしてください。管理画面は `/admin` からログインします。

管理画面の権限判定はサーバー側で `supabase.auth.getUser()` により検証し、`ADMIN_EMAILS` に含まれるメールアドレスだけを許可します。Service Role Keyは管理画面のサーバー処理だけで使用し、ブラウザには送信しません。

## 環境変数

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAILS=
MAX_UPLOAD_MB=5
RATE_LIMIT_SECRET=
GOOGLE_PLACES_API_KEY=
NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED=false
NEXT_PUBLIC_MONETIZATION_ENABLED=false
NEXT_PUBLIC_SPONSOR_INQUIRY_URL=
NEXT_PUBLIC_SUPPORT_URL=
```

| 変数 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ブラウザとサーバーから利用するSupabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | RLS前提で使う公開Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | 管理者処理だけで使うサーバー専用キー |
| `NEXT_PUBLIC_SITE_URL` | メタデータとURL生成に使うサイトURL |
| `ADMIN_EMAILS` | 管理者メールアドレスのカンマ区切りリスト |
| `MAX_UPLOAD_MB` | 証拠資料アップロードの最大サイズ |
| `RATE_LIMIT_SECRET` | IP/メール/ブラウザ識別子のrate limitキーをハッシュするサーバー専用シークレット |
| `GOOGLE_PLACES_API_KEY` | 任意。管理画面でGoogle Places APIから外部集計評価を取得する場合だけ使うサーバー専用キー |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED` | 任意。`true` の場合だけVercel Web Analyticsを読み込む |
| `NEXT_PUBLIC_MONETIZATION_ENABLED` | 任意。`true` の場合だけ収益化枠を表示する。初期値は必ず `false` |
| `NEXT_PUBLIC_SPONSOR_INQUIRY_URL` | 任意。収益化枠の問い合わせ先URL |
| `NEXT_PUBLIC_SUPPORT_URL` | 任意。支援リンクや外部支援ページのURL |

## 実装済み

- Next.js App Router、TypeScript、Tailwind CSSの基本構成
- Supabaseクライアント設定
- Supabase SQLマイグレーション、RLS、private Storage bucket設定
- MVP公開前のRLS/Storage hardening migration
- 共通ヘッダー、フッター、ページ用コンポーネント
- `/`, `/map`, `/areas`, `/areas/[slug]`, `/areas/[slug]/checklist`, `/places/[id]`, `/checklists`, `/topics`, `/topics/[slug]`, `/monetization-policy`, `/reports/new`, `/reports/thanks`, `/objection`, `/guidelines`, `/support`, `/terms`, `/privacy`
- `/admin`, `/admin/reports`, `/admin/reports/[id]`, `/admin/objections`, `/admin/data`
- Leaflet/OpenStreetMapによる地図表示
- 投稿フォーム、サーバー側バリデーション、危険表現の注意表示、証拠画像アップロード
- 異議申立てフォーム、管理者ログイン、投稿審査、証拠画像確認、異議申立て確認
- 投稿フォームと異議申立てフォームの簡易rate limit、honeypot
- 画像アップロード時の拡張子、MIME type、マジックバイト検証
- JPEG、PNG、WebPの可能な範囲でのメタデータ削除
- トラブル時の相談導線ページ
- `.env.example`
- Playwright初期設定と公開ページのスモークテスト
- セキュリティ系レスポンスヘッダーの初期設定
- 外部評価参考値の保存、管理画面入力、Google Places API任意同期、公開ページ表示
- `/checklists` と `/areas/[slug]/checklist` のSEO向け安全確認コンテンツ
- 環境変数OFFがデフォルトのVercel Web Analytics読み込み口と収益化枠
- 管理概況ダッシュボードと初期データCSVのブラウザ内検証画面
- 収益化と掲載独立性の公開方針ページ
- トラブル種別別のSEO向け安全確認ガイド

## DB設計

- `profiles`: Supabase Authユーザーと管理者判定
- `areas`: 対象エリア
- `places`: 店舗または場所の公開可能な基本情報
- `reports`: 非公開デフォルトの投稿本体、承認状態、証拠レベル
- `report_evidence_files`: 非公開Storageパス、ファイル種別、サイズ
- `risk_tags`: リスクタグのマスタ
- `report_risk_tags`: 投稿とリスクタグの中間テーブル
- `objections`: 異議申立て、対象投稿、対応状態
- `admin_actions`: 管理者操作ログ
- `submission_rate_limits`: IP/メール/ブラウザ識別子をハッシュした簡易rate limit状態
- `external_review_sources`: 外部評価ソースのマスタ
- `place_external_refs`: 場所と外部サービス上の参照先の紐付け
- `external_rating_snapshots`: 外部サービス上の集計評価スナップショット

公開用データは `public_reports`、`public_report_risk_tags`、`public_area_summaries`、`public_place_summaries`、`public_place_reports`、`public_external_rating_snapshots` のビューで提供します。`reporter_email`、`private_note`、証拠ファイル情報、外部評価の非公開メモは公開ビューに含めません。

## セキュリティ方針

- RLSを有効化し、公開読み取りは承認済みデータだけに限定する
- Service Role Keyはサーバー専用にし、ブラウザバンドルへ含めない
- `service_role` にはServer Actionと管理処理に必要なDB権限を付与し、anon/authenticatedには非公開テーブルの直接読み取り権限を付与しない
- 証拠画像と投稿者メールアドレスは一般公開しない
- 投稿内容は公開前に個人情報、断定表現、攻撃表現を審査する
- アップロードはサイズ、拡張子、MIME Typeを検証する
- 投稿本文と異議申立て本文に危険表現が含まれる場合、フォーム上で注意し、サーバー側でも保存前に検知する
- 異議申立て内容、申立て者メールアドレス、補足は一般公開しない
- 投稿と異議申立ては、同一IP、同一メールアドレス、同一ブラウザ相当からの短時間連投を制限する
- honeypot項目に値が入った送信は保存しない
- 証拠画像の保存パスと保存ファイル名には元ファイル名を使わず、UUIDベースの名前を使う
- JPEG、PNG、WebPは可能な範囲でメタデータを削除する。HEIC/HEIFは検証のみのため、公開前SOPで手動確認する
- 外部口コミ本文、投稿者名、画像、スクリーンショット、スクレイピングHTMLは保存しない
- 外部評価は本サービスの評価ではなく、出典URLと確認日付きの集計参考値として扱う
- 食べログなど規約確認や許諾が必要なソースは `display_allowed=false` のまま管理し、公開しない

## 法務・UX方針

- UIでは店舗や個人への断定、攻撃、公開嫌がらせ目的の表現を避ける
- 公開表示は「投稿者の申告に基づく情報」「事実確認中の情報を含む」という前提を明示する
- 利用規約、プライバシーポリシー、投稿ガイドラインはMVP用の初期文案であり、本番公開前に専門家確認を行う
- 緊急時は110番、緊急ではない警察相談は #9110、消費生活相談は188、カード決済はカード会社への相談を案内する

## 本番公開前チェック

詳細は `LAUNCH_CHECKLIST.md` を参照してください。最低限、次の項目が未完了の場合は公開しないでください。

- Supabase本番DBに7本のマイグレーションを適用している
- `supabase/verification/non_admin_visibility_checks.sql` の期待値を確認している
- 投稿が `pending` / `Hidden` で保存されることを確認している
- 承認済み投稿だけが公開ページに表示されることを確認している
- 証拠画像、投稿者メールアドレス、非公開メモが公開ビューに含まれないことを確認している
- 管理画面が `ADMIN_EMAILS` でサーバー側制御されることを確認している
- Service Role Keyがブラウザバンドルへ混入していないことを確認している
- 法務文面、投稿ガイドライン、異議申立て運用を人間が確認している
- 簡易rate limit、ブラウザ識別Cookie、honeypotを本番Previewで確認している
- 将来のcaptcha導入方針は `CAPTCHA_FUTURE_NOTES.md` を参照する
- 外部評価を使う場合は `0007_external_rating_snapshots.sql` を適用し、`EXTERNAL_RATING_GUIDE.md` に沿って転載禁止と公開可否を確認する
- 収益化枠は `NEXT_PUBLIC_MONETIZATION_ENABLED=false` を初期値にし、法務・規約・ホスティングプラン確認後にだけ有効化する

## 運用資料

- `LAUNCH_CHECKLIST.md`: 本番公開前チェックリスト
- `LAUNCH_PLAN.md`: MVPリリース手順とロールバック方針
- `OPERATIONS_SOP.md`: 投稿審査、異議申立て、事故時対応
- `LEGAL_REVIEW_NOTES.md`: 法務レビュー論点
- `CAPTCHA_FUTURE_NOTES.md`: Cloudflare Turnstile/hCaptcha導入メモ
- `INITIAL_DATA_TEMPLATE.csv`: 初期データ整理用CSV
- `SEED_DATA_GUIDE.md`: 初期データ投入方針
- `EXTERNAL_RATING_TEMPLATE.csv`: 外部評価スナップショット整理用CSV
- `EXTERNAL_RATING_GUIDE.md`: 外部評価参考値の入力、公開、禁止事項
- `FREE_TIER_GROWTH_PLAN.md`: 無料枠重視のSEO、計測、収益化準備方針
