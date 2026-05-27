# バックアップ・監視Runbook

本番公開後に無料枠を重視しながら、最低限の安全確認を続けるためのRunbookです。

## 毎日確認

- `/healthz` が `200` と `status: ok` を返す。
- `/map`、`/search`、`/reports/new`、`/objection` が表示できる。
- `/admin/reports` が未ログインで `/admin?error=unauthorized` に誘導される。
- `/admin/quality` で未審査、異議申立て、建物情報不足を確認する。
- Vercelの直近デプロイが `Ready` である。

## 毎週確認

- Supabaseのテーブル件数とStorage容量を確認する。
- `report-evidence-files` bucket が private のままであることを確認する。
- `reports`、`report_evidence_files`、`objections`、`admin_actions` のRLSが有効であることを確認する。
- `supabase/verification/non_admin_visibility_checks.sql` を実行する。
- Google Search Console、AdSense、Vercel Analyticsの状態を確認する。

## バックアップ方針

- 無料枠では自動バックアップの保持に制約があるため、公開前と大きなデータ投入前に手動エクスポートする。
- Supabase Dashboardから `reports`、`places`、`areas`、`risk_tags`、`report_risk_tags`、`objections`、`admin_actions` をCSVで保存する。
- 証拠画像は一般公開しない。必要な場合も、管理者だけがSupabase Dashboardで確認する。
- エクスポートしたCSVには投稿者メールや非公開メモが含まれるため、ローカルまたはアクセス制限済みの場所に保管する。

## 障害時対応

1. VercelのDeployment StatusとFunction Logsを確認する。
2. SupabaseのAPI、Auth、Database、Storageの状態を確認する。
3. 投稿フォームまたは異議申立てフォームで障害がある場合は、SNSやトップページで再送を促す前に原因を確認する。
4. 公開ページに非公開情報が出た疑いがある場合は、対象投稿を `hidden` にし、Vercelを再デプロイする。
5. 対応内容を `OPERATIONS_SOP.md` の運用ログとして残す。

## 公開NG条件

- RLS確認が未完了。
- Storage private確認が未完了。
- Service Role Key混入チェックが未完了。
- 投稿者メール、非公開メモ、証拠画像URLが公開ページに表示される。
- 法務文面の人間レビューが未完了。
