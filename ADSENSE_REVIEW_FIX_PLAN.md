# AdSense再審査対応メモ

## 確認日

2026-06-22

## AdSense画面で確認した状態

- 対象サイト: `nyutenmae-check-tokyo.vercel.app`
- 承認状況: 要確認
- ads.txt: 承認済み
- 指摘: 有用性の低いコンテンツ
- 画面上の説明: サイト運営者ネットワークの利用要件、コンテンツの最小要件、独自性のある質の高いコンテンツ、ユーザーエクスペリエンスの確認が必要

## 今回の対応方針

AdSense審査で評価させるページを、利用者向けの独自コンテンツに寄せる。

- インデックス対象を、トップ、エリア、汎用ガイド、公式ソース、相談導線、掲載方針へ絞る。
- 大量生成されるエリア別ガイド派生ページ、トピック派生ページ、エリア別チェックリスト、記録保存、情報提供ページは、noindexかつsitemap除外にする。
- 出典詳細ページは保持するが、AdSense再審査中は検索対象にせず、`/sources` の一覧ページへ評価を集約する。
- 投稿フォーム、SNS運用、スポンサー、内部ロードマップなど、検索流入向けではないページはnoindexにする。
- トップページに、公式ソース、実用ガイド、公開前審査の独自価値を明示する。
- `/sources` と主要ガイドページは、単なるリンク集や箇条書きではなく、編集基準、審査レーン、相談導線、公開しない情報まで説明する。

## 再申請前チェック

1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. `npm run verify:production`
5. 本番の `/sitemap.xml` から以下が消えていることを確認する。
   - `/reports/new`
   - `/reports/quick`
   - `/roadmap`
   - `/social`
   - `/sponsor`
   - `/coverage/candidates`
   - `/areas/*/guides/*`
   - `/areas/*/topics/*`
   - `/areas/*/checklist`
   - `/areas/*/evidence`
   - `/areas/*/contribute`
   - `/sources/*`
6. 本番の主要ページが表示できることを確認する。
   - `/`
   - `/areas`
   - `/guides`
   - `/sources`
   - `/support`
   - `/trust`
   - `/terms`
   - `/privacy`
7. Search Consoleでサイトマップ送信またはURL検査を行う。
8. 数日から1週間程度クロール反映を待ってからAdSenseへ再審査を依頼する。

## 再申請を急がない条件

- 公開ページに空表示や「準備中」だけのページが多い。
- 実用ガイドや公式ソースページが本番でクロールされていない。
- 法務文面、プライバシーポリシー、利用規約の人間レビューが未完了。
- 広告配置が誤クリックを誘う位置にある。
