# 無料枠重視の成長・収益化準備メモ

## 方針

フェーズ7では、すぐに広告収益化を開始せず、無料枠を守りながら検索流入、計測、将来の収益化差し込み口を整える。

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
- `/sources`: 公的・公式情報ソースの公開ページ
- `/admin/research`: 管理者向け調査キュー
- `SOURCE_RESEARCH_QUEUE.csv`: 初期データ化前の公式ソース一覧

## 無料枠での運用

1. `NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED=false` のまま公開し、必要になったらVercel Web Analyticsの無料枠内でONにする。
2. `NEXT_PUBLIC_MONETIZATION_ENABLED=false` のまま公開し、広告、スポンサー、支援リンクの文面レビュー後にONにする。
3. Google Places APIなど有料化し得る外部APIは、キーを設定しない限り呼ばない。
4. 初期データは手動確認とCSV整理を優先し、自動収集やスクレイピングを行わない。
5. 収益化を実際に開始する前に、Vercel Hobbyの商用利用条件、AdSense等のポリシー、Cookie/プライバシー表示、法務文面を確認する。

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
- フェーズ10: 公的・公式情報ソースの調査キューと情報ゼロ対策（実装済み）
- フェーズ11: エリア別SEOコンテンツの追加、構造化データ拡充、内部リンク改善
- フェーズ12: 規約確認後の収益化ON、AdSenseまたはスポンサー枠の限定運用
- フェーズ13: 初期データの人力検証、公開候補の増加、問い合わせフォーム連携
