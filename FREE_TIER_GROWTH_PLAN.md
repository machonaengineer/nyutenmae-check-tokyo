# 無料枠重視の成長・収益化準備メモ

## 方針

フェーズ7から11では、すぐに広告収益化を開始せず、無料枠を守りながら検索流入、出典付き初期データ運用、計測、将来の収益化差し込み口を整える。

## 実装済み

- `/checklists`: 入店前、会計前、退店後の安全確認コンテンツ
- `/areas/[slug]/checklist`: 初期対象エリア別の確認コンテンツ
- `MonetizationSlot`: 環境変数OFFがデフォルトの収益化枠
- `AnalyticsGate`: 環境変数ON時のみVercel Web Analyticsを読み込む
- `AdsenseGate`: 環境変数ON時のみAdSenseスクリプトを読み込む
- `/ads.txt`: Vercel環境変数からGoogle向けads.txtを返す
- sitemapにチェックリストページを追加
- `/admin`: 管理概況ダッシュボード
- `/admin/data`: 初期データCSVの検証と、非公開デフォルトの安全投入
- `/monetization-policy`: 収益化と掲載独立性の公開方針
- `/topics`, `/topics/[slug]`: トラブル種別別の安全確認ガイド
- `/areas/[slug]/topics/[topicSlug]`: エリア×種別別の確認ページ
- `/contribute`: 情報提供を増やすための公開導線
- `/sponsor`: スポンサー・広告相談の公開導線
- `/social`: SNS共有と情報提供導線
- `/admin/social`: 管理者向けSNS文面テンプレート
- Open Graph画像とSNS共有ボタン
- `/sources`: 情報ソースの公開ページ
- `/areas/[slug]`: エリア別の公的・公式確認先表示
- `/search`: 承認済み投稿がない検索でも、関連エリアと公式確認先を表示
- `/`: 初期対象エリア数、公式確認先数、公開前審査方針を見える化
- `/admin/research`: 管理者向け調査キュー
- `SOURCE_RESEARCH_QUEUE.csv`: 初期データ化前の公式ソース一覧
- `/sponsor`: 非公開スポンサー問い合わせフォーム
- `/admin/sponsors`: スポンサー問い合わせ確認画面
- WebSite/FAQ/CollectionPageの構造化データ
- `/llms.txt`: AIクローラー向けの公開方針と主要ページ一覧
- `reports.source_type/source_url/source_title/source_checked_at`: 公的情報、報道、外部傾向を本文転載は禁止の独自要約として扱う出典メタ情報
- `supabase/migrations/0008_report_source_attribution.sql`: 承認済み投稿だけを公開する既存方針を保ったまま、公開ビューに出典メタ情報を追加
- 実名入り初期データ候補CSV: Git管理せず、管理画面貼り付けまたはサーバー側環境変数だけで扱う。公開は人間審査後のみ

## 無料枠での運用

1. `NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED=false` のまま公開し、必要になったらVercel Web Analyticsの無料枠内でONにする。
2. `NEXT_PUBLIC_MONETIZATION_ENABLED=false` のまま公開し、広告、スポンサー、支援リンクの文面レビュー後にONにする。
3. Google Places APIなど有料化し得る外部APIは、キーを設定しない限り呼ばない。
4. 初期データは手動確認とCSV整理を優先し、自動収集やスクレイピングを行わない。
5. 収益化を実際に開始する前に、Vercel Hobbyの商用利用条件、AdSense等のポリシー、Cookie/プライバシー表示、法務文面を確認する。
6. 報道や外部口コミ傾向は、URL、確認日、独自要約、リスクタグとして扱い、本文、画像、スクリーンショットを保存しない。

## 収益化ONの条件

- 法務文面、プライバシーポリシー、利用規約の人間レビューが完了している
- スポンサー表示が公開順位、審査、リスクタグ、証拠レベルに影響しないことを明記している
- Vercel/Supabaseの利用プランと商用利用条件を確認している
- AdSenseを使う場合、ads.txt、広告配置、無効クリック対策、Cookie表示を確認している
- 広告タグや支援リンクが、証拠画像、投稿者メールアドレス、非公開メモにアクセスしない
- 公開UIに禁止表現が残っていない

## 次フェーズ候補

- フェーズ8: 管理画面の簡易KPI、CSV投入補助、公開候補レビュー導線（実装済み）
- フェーズ9: SNS共有導線、OG画像、管理者向けSNS文面テンプレート（実装済み）
- フェーズ10: 情報ソースの調査キューと情報ゼロ対策（実装済み）
- フェーズ11: 収益化準備、スポンサー問い合わせフォーム、管理確認画面、出典付き公開候補運用（実装済み）
- フェーズ12: 構造化データ拡充、`/llms.txt`、内部リンク改善（実装済み）
- フェーズ13: 規約確認後の収益化ON、AdSenseまたはスポンサー枠の限定運用
- フェーズ14: 初期データの人力検証、公開候補の増加、問い合わせフォーム連携
