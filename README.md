# 入店前チェック東京

キャッチについて行く前に見る、都内繁華街の注意マップ。

## Open-source status

This is a public, actively maintained TypeScript/Next.js project for safety-oriented local reporting in Tokyo nightlife areas.

The project focuses on moderation, private evidence handling, public-source attribution, Supabase RLS/privacy controls, production verification, and cautious public copy for a reputation-sensitive reporting workflow.

Primary maintainer: Ryunosuke Imai (`machonaengineer`).

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
npm run check:sources:dry
npm run check:official-seed
npm run kpi:summary
npm run verify:production
npm run test:e2e
```

## AdSense再審査メモ

AdSenseで `有用性の低いコンテンツ` が出た場合は、[ADSENSE_REVIEW_FIX_PLAN.md](./ADSENSE_REVIEW_FIX_PLAN.md) を確認してください。

再審査前は、検索対象をトップ、エリア、汎用ガイド、トピック別ガイド、FAQ、公式ソース一覧、相談導線、掲載方針に絞ります。フォーム、SNS運用、スポンサー、内部ロードマップ、出典詳細、エリア別の派生ページはsitemapから外してnoindexにします。広告表示は審査通過前に有効化しないでください。Search Consoleでは `/sitemap.xml` を再送信し、主要URLのURL検査後、数日から1週間程度クロール反映を待ってから再審査します。

## Supabaseセットアップ

1. Supabaseプロジェクトを作成する
2. `supabase/migrations/0001_initial_schema.sql` をSQL Editorで実行する
3. `supabase/migrations/0002_public_map_detail_views.sql` をSQL Editorで実行する
4. `supabase/migrations/0003_mvp_release_hardening.sql` をSQL Editorで実行する
5. `supabase/migrations/0004_submission_hardening.sql` をSQL Editorで実行する
6. `supabase/migrations/0005_browser_rate_limit_key.sql` をSQL Editorで実行する
7. `supabase/migrations/0006_service_role_privileges.sql` をSQL Editorで実行する
8. `supabase/migrations/0007_external_rating_snapshots.sql` をSQL Editorで実行する
9. `supabase/migrations/0008_report_source_attribution.sql` をSQL Editorで実行する
10. `supabase/migrations/0009_building_level_place_tracking.sql` をSQL Editorで実行する
11. `supabase/migrations/0010_initial_data_review_workflow.sql` をSQL Editorで実行する
12. `supabase/migrations/0011_area_expansion.sql` をSQL Editorで実行する
13. `.env.local` にSupabaseの値を設定する
14. 管理者ユーザーをSupabase Authで作成する
15. 管理者メールを `profiles` でadminに更新する

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
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_MONETIZATION_ENABLED=false
NEXT_PUBLIC_SPONSOR_INQUIRY_URL=
NEXT_PUBLIC_SUPPORT_URL=
NEXT_PUBLIC_X_PROFILE_URL=
NEXT_PUBLIC_INSTAGRAM_PROFILE_URL=
NEXT_PUBLIC_TIKTOK_PROFILE_URL=
NEXT_PUBLIC_LINE_PROFILE_URL=
SNS_AUTO_POST_ENABLED=false
SNS_AUTO_POST_QUEUE_FILE=SNS_AUTO_POST_QUEUE.csv
SNS_AUTO_REPLY_ENABLED=false
SNS_REPLY_QUEUE_FILE=SNS_REPLY_QUEUE.csv
X_USER_ACCESS_TOKEN=
X_POST_PROFILE_USERNAME=nyutenmaecheck
NEXT_PUBLIC_ADSENSE_VERIFICATION_ENABLED=false
NEXT_PUBLIC_ADSENSE_ENABLED=false
NEXT_PUBLIC_ADSENSE_CLIENT=
NEXT_PUBLIC_ADSENSE_SLOT_CHECKLIST=
NEXT_PUBLIC_ADSENSE_SLOT_AREA=
NEXT_PUBLIC_ADSENSE_SLOT_SUPPORT=
ADS_TXT_GOOGLE_PUBLISHER_ID=
INITIAL_DATA_CANDIDATES_CSV=
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
| `NEXT_PUBLIC_GA_ID` | 任意。GA4測定ID。未設定時は本番MVP用の公開測定ID `G-GBGMP0T3M8` を使う |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | 任意。Search ConsoleのHTMLタグ確認で発行される `content` 値。未設定時はmetaタグを出さない |
| `NEXT_PUBLIC_MONETIZATION_ENABLED` | 任意。`true` の場合だけ収益化枠を表示する。初期値は必ず `false` |
| `NEXT_PUBLIC_SPONSOR_INQUIRY_URL` | 任意。収益化枠の問い合わせ先URL |
| `NEXT_PUBLIC_SUPPORT_URL` | 任意。支援リンクや外部支援ページのURL |
| `NEXT_PUBLIC_X_PROFILE_URL` | 任意。公式XプロフィールURL |
| `NEXT_PUBLIC_INSTAGRAM_PROFILE_URL` | 任意。公式InstagramプロフィールURL |
| `NEXT_PUBLIC_TIKTOK_PROFILE_URL` | 任意。公式TikTokプロフィールURL |
| `NEXT_PUBLIC_LINE_PROFILE_URL` | 任意。公式LINEまたはLINE関連URL |
| `SNS_AUTO_POST_ENABLED` | 任意。`true` の場合だけ承認済みSNSキューを公式APIへ投稿する。初期値は必ず `false` |
| `SNS_AUTO_POST_QUEUE_FILE` | 任意。SNS自動投稿キューCSVのパス |
| `SNS_AUTO_REPLY_ENABLED` | 任意。`true` の場合だけ承認済み返信キューを公式APIへ投稿する。初期値は必ず `false` |
| `SNS_REPLY_QUEUE_FILE` | 任意。SNS返信キューCSVのパス |
| `X_USER_ACCESS_TOKEN` | 任意。X API投稿用のユーザーアクセストークン。サーバー専用で、ブラウザへ出さない |
| `X_POST_PROFILE_USERNAME` | 任意。投稿後URLを記録するためのXユーザー名 |
| `NEXT_PUBLIC_ADSENSE_VERIFICATION_ENABLED` | 任意。AdSenseの所有権確認コードだけを読み込む。広告枠表示前の審査用で、初期値は `false` |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | 任意。`true` の場合だけAdSense広告ユニットを表示する。審査通過前は必ず `false` |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | 任意。AdSenseの `ca-pub-...` 形式client ID。公開値だが、アカウントログイン情報は保存しない |
| `NEXT_PUBLIC_ADSENSE_SLOT_CHECKLIST` | 任意。`/checklists` 用のAdSense ad slot ID |
| `NEXT_PUBLIC_ADSENSE_SLOT_AREA` | 任意。将来のエリアページ用AdSense ad slot ID |
| `NEXT_PUBLIC_ADSENSE_SLOT_SUPPORT` | 任意。将来の支援ページ用AdSense ad slot ID |
| `ADS_TXT_GOOGLE_PUBLISHER_ID` | 任意。`/ads.txt` で返す `pub-...` 形式publisher ID |
| `INITIAL_DATA_CANDIDATES_CSV` | 任意。管理者限定の候補一括投入に使うサーバー専用CSV。実名入り候補CSVはGit管理しない |

## 実装済み

- Next.js App Router、TypeScript、Tailwind CSSの基本構成
- Supabaseクライアント設定
- Supabase SQLマイグレーション、RLS、private Storage bucket設定
- MVP公開前のRLS/Storage hardening migration
- 共通ヘッダー、フッター、ページ用コンポーネント
- `/`, `/map`, `/areas`, `/areas/[slug]`, `/areas/[slug]/checklist`, `/areas/[slug]/evidence`, `/areas/[slug]/contribute`, `/areas/[slug]/guides/[guideSlug]`, `/areas/[slug]/topics/[topicSlug]`, `/places/[id]`, `/search`, `/checklists`, `/guides`, `/guides/[slug]`, `/topics`, `/topics/[slug]`, `/contribute`, `/sources`, `/sources/[id]`, `/coverage`, `/coverage/candidates`, `/trust`, `/social`, `/roadmap`, `/sponsor`, `/monetization-policy`, `/reports/new`, `/reports/quick`, `/reports/thanks`, `/objection`, `/guidelines`, `/support`, `/terms`, `/privacy`
- `/admin`, `/admin/reports`, `/admin/reports/[id]`, `/admin/objections`, `/admin/data`, `/admin/quality`, `/admin/research`, `/admin/area-ops`, `/admin/social`, `/admin/sponsors`
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
- 環境変数OFFがデフォルトのVercel Web Analytics / GA4読み込み口と収益化枠
- 管理概況ダッシュボードと初期データCSVの検証、非公開デフォルト投入画面
- 収益化と掲載独立性の公開方針ページ
- 環境変数OFFがデフォルトのAdSense差し込み口と `/ads.txt`
- 承認済みplaceだけを対象にした店舗名・住所・建物検索
- エリア×トラブル種別のSEO向け確認ページ
- 情報提供募集ページとスポンサー問い合わせページ
- トラブル種別別のSEO向け安全確認ガイド
- SNS共有ページ、共有ボタン、管理者向けSNS文面テンプレート、Open Graph画像、承認済みキューだけを対象にする公式API投稿スクリプト
- 情報ソースページ、管理者向け調査キュー、`SOURCE_RESEARCH_QUEUE.csv`
- `/sources` で、公的情報・報道などの実出典を、出典URL、確認日、独自要約、公開しない情報、次の確認に分けて表示。`/sources/[id]` は保持するが、AdSense再審査中は検索対象にせず、一覧ページに評価を集約
- 情報蓄積状況ページで、調査ソース、公式・公的情報、報道、審査待ち候補、エリア別の次アクションを表示
- エリア詳細ページでの公的・公式確認先表示
- 検索結果ゼロ時の関連エリア、公式確認先表示
- 管理画面での店舗名・住所・建物名・階数検索と、同一住所・同一建物の確認候補表示
- 管理画面の品質キューで、建物情報不足、未審査、出典確認待ち、未対応異議、同一住所・同一建物候補を確認
- 管理画面の初期データ審査キューで、候補を `needs_review / Hidden` として非公開投入。実名入り候補CSVはGit管理せず、管理画面貼り付けまたはサーバー側環境変数だけで扱う
- 管理画面の候補審査DBで、出典確認、独自要約確認、建物確認、法務・表現確認、非公開投入判断を追跡
- 掲載対象エリアを12エリアへ拡大。承認済み投稿がないエリアは空状態と確認導線だけを表示
- 12エリアごとの詳細ガイド、記録保存ガイド、情報提供ガイドを追加。投稿が少ない段階でも、入店前確認、会計前確認、証拠保存、相談導線の価値を提供
- `AREA_DATA_COLLECTION_QUEUE.csv` で、エリアごとの公式ソース、ユーザー報告、建物確認、コンテンツ増強の調査トラックを管理
- `/admin/area-ops` で、エリアごとの公式ソース、投稿導線、建物確認、コンテンツ増強、ソース再確認目安を管理
- `npm run check:sources` で、`SOURCE_RESEARCH_QUEUE.csv` の公式URLを無料範囲で手動確認
- `OFFICIAL_SOURCE_SEED_CANDIDATES.csv` と `/admin/data` の公式ソース安全候補パネルで、12エリア分の公式ソース由来候補を非公開審査DBへ登録
- `MEDIA_EVIDENCE_CANDIDATES_2026-05-28.csv` と `/admin/data` のメディア由来の証拠候補パネルで、報道・記事由来の候補を非公開審査DBへ登録
- `npm run check:official-seed` で、公式ソース安全候補CSVの非公開デフォルト、Hidden固定、禁止表現、非公開情報マーカーを検査
- `/roadmap` でフェーズ13〜50の改善予定と公開情報の扱い方を表示
- `/trust` で公開する情報、公開しない情報、審査、収益化独立性を表示
- `/coverage` にエリア別の「次に厚くする順」を表示し、検索流入、情報提供、非公開審査への接続を整理
- `/social` にエリア別の投稿テンプレートを表示し、確認リストや相談先への共有導線を追加
- `SNS_AUTO_POSTING_RUNBOOK.md`、`SNS_AUTO_POST_QUEUE.csv`、`npm run social:prepare`、`npm run social:autopost` で、日次キュー生成とデフォルトOFFのSNS自動投稿準備を追加
- `SNS_REPLY_OUTREACH_RUNBOOK.md`、`SNS_REPLY_QUEUE.csv`、`npm run social:reply` で、@メンションまたは引用で呼ばれた場合だけ使う承認制返信キューを追加
- `/guides` と `/areas/[slug]/guides/[guideSlug]` で、検索流入向けの実用ガイドを6テーマ x 12エリアへ展開
- `/reports/quick` で、非公開デフォルトの30秒投稿導線を追加
- `/coverage/candidates` で、公式ソースや候補を公開可能なエリア注意情報へ育てる確認ステージを表示
- Vercel Analytics有効時だけCTAクリックを記録する `TrackedLink` を追加。デフォルトでは計測OFF
- トップページでの掲載対象エリア数、公式確認先数、情報提供導線の表示
- スポンサー問い合わせフォームと管理画面。問い合わせ内容は公開せず `admin_actions` で管理
- WebSite/FAQ/CollectionPageの構造化データ、トピック詳細のFAQ構造化データ、公開方針だけを載せる `/llms.txt`
- `npm run verify:production` による本番公開ページ、sitemap、robots、非公開情報マーカーの簡易スモーク確認

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

`reports` は投稿者申告以外の公開候補も扱えるように、`source_type`、`source_url`、`source_title`、`source_checked_at` を持ちます。公的情報、報道、外部傾向を使う場合も、本文転載は禁止し、公開サマリーは独自要約として審査します。

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
- AdSense広告ユニットは `NEXT_PUBLIC_MONETIZATION_ENABLED=true` かつ `NEXT_PUBLIC_ADSENSE_ENABLED=true` の場合だけ表示し、管理画面、投稿フォーム、異議申立てフォームには配置しない
- 所有権確認だけが必要な場合は `NEXT_PUBLIC_ADSENSE_VERIFICATION_ENABLED=true` と `NEXT_PUBLIC_ADSENSE_CLIENT` を設定し、広告ユニット用slotは未設定のままにする
- SNSには証拠画像、投稿者メールアドレス、非公開メモ、外部口コミ本文、スクリーンショットを載せない
- スポンサー問い合わせは公開ページに表示せず、管理者だけが確認する
- 構造化データ、sitemap、`/llms.txt` には公開方針と公開ページURLだけを載せ、非公開DBカラムや証拠ファイルパスを含めない
- 公的情報や報道由来の公開候補は、出典種別、出典URL、出典タイトル、確認日を分けて保存し、本文転載は禁止した独自要約だけを公開審査対象にする
- 同一住所・同一建物候補は管理者確認用であり、同一運営や同一店舗と断定しない

## 法務・UX方針

- UIでは店舗や個人への断定、攻撃、公開嫌がらせ目的の表現を避ける
- 公開表示は「投稿者の申告に基づく情報」「事実確認中の情報を含む」という前提を明示する
- 利用規約、プライバシーポリシー、投稿ガイドラインはMVP用の初期文案であり、本番公開前に専門家確認を行う
- 緊急時は110番、緊急ではない警察相談は #9110、消費生活相談は188、カード決済はカード会社への相談を案内する

## 本番公開前チェック

詳細は `LAUNCH_CHECKLIST.md` を参照してください。最低限、次の項目が未完了の場合は公開しないでください。

- Supabase本番DBに9本のマイグレーションを適用している
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
- AdSenseを使う場合は `ADSENSE_SETUP_GUIDE.md` に沿ってads.txt、広告配置、Cookie表示、無効クリック対策を確認する
- `/llms.txt` と構造化データに、投稿者メールアドレス、非公開メモ、証拠ファイルパス、外部本文転載が含まれていないことを確認する
- 出典付き公開候補を承認する前に、出典URL、確認日、独自要約、禁止表現、非公開情報の混入がないことを確認する

## 運用資料

- `PRODUCT_GOAL_AND_ARCHITECTURE.md`: 最終目標、非目標、データライフサイクル
- `PRODUCT_KGI_KPI.md`: 12か月KGI、90日KGI、日次/週次KPI運用
- `PRODUCT_KGI_KPI_SCORECARD.csv`: 安全、情報供給、利用、収益化のKGI/KPIスコアカード
- `PRODUCT_KPI_LOG_TEMPLATE.csv`: Search Console、Supabase、SNS、収益化の週次実績ログテンプレート
- `LAUNCH_CHECKLIST.md`: 本番公開前チェックリスト
- `LAUNCH_PLAN.md`: MVPリリース手順とロールバック方針
- `OPERATIONS_SOP.md`: 投稿審査、異議申立て、事故時対応
- `LEGAL_REVIEW_NOTES.md`: 法務レビュー論点
- `CAPTCHA_FUTURE_NOTES.md`: Cloudflare Turnstile/hCaptcha導入メモ
- `INITIAL_DATA_TEMPLATE.csv`: 初期データ整理用CSV
- `SEED_DATA_GUIDE.md`: 初期データ整理、検証、非公開デフォルト投入方針
- `EXTERNAL_RATING_TEMPLATE.csv`: 外部評価スナップショット整理用CSV
- `EXTERNAL_RATING_GUIDE.md`: 外部評価参考値の入力、公開、禁止事項
- `FREE_TIER_GROWTH_PLAN.md`: 無料枠重視のSEO、計測、収益化準備方針
- `ADSENSE_SETUP_GUIDE.md`: AdSense導入時の環境変数、ads.txt、ポリシーチェック
- `SOCIAL_GROWTH_PLAN.md`: SNS共有、文面テンプレート、自動投稿キューの運用方針
- `SNS_OPERATIONS_SOP.md`: SNS投稿、返信、禁止事項の運用手順
- `SNS_AUTO_POSTING_RUNBOOK.md`: X公式APIと無料枠暫定Chrome運用を使う自動投稿の承認キュー運用
- `SNS_REPLY_OUTREACH_RUNBOOK.md`: X公式APIを使う返信案内の承認キュー運用
- `SOCIAL_CONTENT_CALENDAR.csv`: 初週のX投稿カレンダー
- `SNS_AUTO_POST_QUEUE.csv`: `approved` の行だけを投稿対象にする自動投稿キュー
- `SNS_REPLY_QUEUE.csv`: `summoned_account=yes` かつ `approved` の行だけを返信対象にするキュー
- `SNS_KPI_LOG_TEMPLATE.csv`: SNS投稿の表示、クリック、保存、情報提供遷移を記録する日次ログテンプレート
- `SOURCE_RESEARCH_QUEUE.csv`: 公的・公式ソースの調査キュー
- `SOURCE_LINK_CHECK_LOG_2026-07-05.md`: 2026-07-05時点の情報ソースURL到達確認ログ
- `AREA_DATA_COLLECTION_QUEUE.csv`: 12エリア別の情報収集・建物確認・コンテンツ増強キュー
- `OFFICIAL_SOURCE_SEED_CANDIDATES.csv`: 12エリア分の公式ソース由来の非公開審査候補CSV
- `MEDIA_EVIDENCE_CANDIDATES_2026-05-28.csv`: 報道、記事、自治体公表から作成した非公開審査候補CSV
- `MEDIA_EVIDENCE_COLLECTION_2026-05-28.md`: メディア由来候補の収集方針、転載禁止、審査メモ
- `PHASE_26_AREA_OPERATIONS_PLAN.md`: エリア別情報蓄積オペレーション管理の実装方針
- `PHASE_27_SAFE_SEEDING_PLAN.md`: 公式ソース安全候補を審査DBへ登録する運用方針
- `PHASE_28_PRODUCTION_SEED_RUN.md`: 本番DBの審査ワークフロー適用と公式候補12件登録の実行記録
- `PHASE_29_50_EXPANSION_ROADMAP.md`: フェーズ29〜50の安全成長ロードマップ
- `PHASE_29_50_EXECUTION_MATRIX.csv`: フェーズ29〜50の無料枠アクション、安全ゲート、成果物
- `PHASE_51_DEEP_REVIEW_WORKFLOW.md`: 初期データ候補を条件確認後に非公開投稿へ進める実運用ワークフロー
- `PHASE_52_ZERO_TO_SIGNAL_PLAN.md`: 情報ゼロ状態から検索流入、投稿獲得、非公開審査へつなげる実装方針
- `AREA_TRACTION_MATRIX.csv`: 12エリア別の検索意図、データ需要、管理アクション、収益化ゲート
- `PHASE_53_57_GROWTH_SPRINT.md`: 認知、検索コンテンツ、簡易投稿、公開候補化、無料計測の実装方針
- `SOCIAL_POST_TEMPLATES.csv`: 30日分の投稿テンプレート
- `supabase/verification/phase28_official_seed_candidate_checks.sql`: フェーズ28登録後のRLSと候補状態確認SQL
- `INITIAL_DATA_REVIEW_QUEUE.csv`: 初期データ候補の審査順と確認項目
- `DATA_COLLECTION_PLAYBOOK.md`: 情報ゼロ状態から安全に初期データを増やす手順
- `DATA_QUALITY_SOP.md`: 建物情報、同一住所・同一建物候補、初期データ審査の運用手順
- `BACKUP_AND_MONITORING_RUNBOOK.md`: 本番公開後の監視、バックアップ、障害時対応
- `PHASE_13_20_ROADMAP.md`: フェーズ13〜20の実施方針
- `PHASE_21_DATA_INTAKE_PLAN.md`: 初期データ投入とSEO流入の土台作り
- `PHASE_22_REVIEW_IMPORT_PLAN.md`: 審査キューから非公開投入までの短縮
- `PHASE_23_REVIEW_WORKFLOW_PLAN.md`: 初期データ候補を管理者限定の審査DBで扱う運用
- `PHASE_24_AREA_EXPANSION_PLAN.md`: 掲載エリア拡大と公開範囲の安全方針
- `PHASE_25_CONTENT_DEPTH_PLAN.md`: エリア別コンテンツ増強と調査キューの安全方針
- `PHASE_26_AREA_OPERATIONS_PLAN.md`: 管理画面でのエリア別運用キュー、ソース鮮度、リンク確認の方針
- `PHASE_27_SAFE_SEEDING_PLAN.md`: 公式ソース由来のエリア単位候補を非公開審査DBへ登録する方針
- `PHASE_28_PRODUCTION_SEED_RUN.md`: 本番DBへ0010/0011を適用し、公式候補12件を非公開審査DBに登録した記録
- `PHASE_29_50_EXPANSION_ROADMAP.md`: フェーズ50までの信頼、審査、収益化、運用監視の成長設計
- `PHASE_51_DEEP_REVIEW_WORKFLOW.md`: 審査済み候補だけを非公開デフォルトの投稿へ作成する管理導線
- `PHASE_52_ZERO_TO_SIGNAL_PLAN.md`: 公開投稿が少ない段階でも価値を出すエリア別成長設計
- `PHASE_53_57_GROWTH_SPRINT.md`: 認知不足とコンテンツ不足を補う成長スプリント

## KGI / KPI運用

最終ゴールは、入店前に確認される審査制の注意情報インフラにし、公開情報の安全性を壊さず月次収益化を成立させることです。

日次の状態確認:

```bash
npm run kpi:summary
```

週次では、Search Console、Vercel/GA4、Supabase管理画面、SNS実績、スポンサー問い合わせを `PRODUCT_KPI_LOG_TEMPLATE.csv` に転記します。Safety KPIが赤の場合は、成長施策や収益化より先に公開停止、RLS、Storage、非公開情報混入の確認を優先します。
