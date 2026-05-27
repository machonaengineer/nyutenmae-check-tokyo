# フェーズ23: 初期データ審査ワークフローDB化

## 目的

実名入り候補CSVを直接公開投稿へ投入する前に、管理者限定の審査タスクとしてDBへ保存し、出典確認、独自要約確認、建物情報確認、法務・表現確認の状態を追跡できるようにする。

## 実装済み

- `supabase/migrations/0010_initial_data_review_workflow.sql` を追加した。
- `initial_data_review_candidates` はRLS有効、FORCE RLS有効、anon/authenticatedへの直接権限なし、service roleのみ操作可にした。
- `/admin/data` に「候補CSVを審査DBへ登録」フォームを追加した。
- `/admin/data` に候補ごとの審査状態更新UIを追加した。
- `import_private` 判断へ進めるには、出典確認、公開サマリー確認、建物確認、法務確認を必須にした。
- 実名入り候補CSVは引き続きGit管理しない。

## 運用ルール

1. 実名入り候補CSVは公開リポジトリへコミットしない。
2. `/admin/data` の「候補CSVを審査DBへ登録」へ貼り付ける。
3. 候補ごとに出典URL、確認日、店名または住所、建物名、階数、公開サマリーを確認する。
4. 公開サマリーは外部本文や口コミ本文の転載ではなく、独自要約にする。
5. `import_private` は公開承認ではなく、既存の非公開投稿審査フローへ進める判断として扱う。
6. 公開ページに出るのは、既存の `reports.status = approved` だけに限定する。

## 次の改善

- `import_private` 候補から非公開投稿を1クリック作成する。
- 候補と作成済み `reports.id` を自動で紐付ける。
- 出典URLの到達確認とアーカイブ確認を管理画面から実行する。
