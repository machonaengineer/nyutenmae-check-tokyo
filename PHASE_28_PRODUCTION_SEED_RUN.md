# フェーズ28: 本番DB審査ワークフロー適用と公式候補登録

## 目的

公式ソース由来のエリア単位候補を、公開投稿ではなく管理者限定の非公開審査DBに登録する。

## 実施日

2026-05-27

## 実施内容

1. Supabase本番DBで `initial_data_review_candidates` の存在を確認した。
2. 未作成だったため、以下のmigrationをSQL Editorで適用した。
   - `supabase/migrations/0010_initial_data_review_workflow.sql`
   - `supabase/migrations/0011_area_expansion.sql`
3. `/admin/data` の `公式ソース安全候補` から12件を審査DBへ登録した。
4. 登録結果は `official_seed=success&official_staged=12&official_skipped=0`。
5. 登録後にRLSと候補状態を確認した。

## 確認結果

- `initial_data_review_candidates` は存在する。
- 拡張エリアのうち `roppongi-azabujuban` と `kichijoji` が存在する。
- 公式候補12件は `proposed_status=needs_review`。
- 公式候補12件は `evidence_level=Hidden`。
- 公式候補12件は `publish_decision=undecided`。
- 公式候補12件は `place_name` が `エリア注意情報` で始まるエリア単位候補。
- `initial_data_review_candidates` はRLS有効。
- `initial_data_review_candidates` はForce RLS有効。
- `anon` と `authenticated` は `initial_data_review_candidates` を直接読めない。
- `service_role` のみ管理処理で読める。

## 重要な運用判断

- 今回登録した12件は公開投稿ではない。
- 今回登録した12件は個別店舗の注意報告ではない。
- 公式ページ本文、店舗一覧、電話番号、個人情報は転載しない。
- 個別店舗や住所の公開候補にするには、別途出典確認、建物確認、独自要約確認、法務確認が必要。
- `import_private` にしても非公開投稿作成に留まり、公開承認ではない。

## 次に見る画面

- `/admin/data`: 公式候補12件の審査状態
- `/admin/quality`: 出典確認、表現確認、建物確認の優先キュー
- `/admin/area-ops`: エリア別のソース鮮度、リンク確認、情報厚み

## 再確認SQL

`supabase/verification/phase28_official_seed_candidate_checks.sql` をSupabase SQL Editorで実行する。

