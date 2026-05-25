-- Supabase SQL Editorでマイグレーション適用後に実行する確認用SQLです。
--
-- 期待値:
-- 1. publicの主要テーブルはRLSが有効で、FORCE RLSも有効。
-- 2. Storage bucket report-evidence-files は private。
-- 3. 公開ビューには reporter_email / private_note / storage_path が存在しない。
-- 4. 公開ビューには approved 以外の投稿が出ない。
-- 5. anon/authenticated は reports / evidence / objections / admin_actions を直接読めない。
-- 6. submission_rate_limits はRLS有効で、一般ユーザーが直接読めない。

select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'profiles',
    'areas',
    'places',
    'reports',
    'report_evidence_files',
    'risk_tags',
    'report_risk_tags',
    'objections',
    'admin_actions',
    'submission_rate_limits'
  )
order by c.relname;

select
  id,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id = 'report-evidence-files';

select
  table_name,
  column_name
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'public_reports',
    'public_report_risk_tags',
    'public_area_summaries',
    'public_place_summaries',
    'public_place_reports'
  )
  and column_name in (
    'reporter_email',
    'requester_email',
    'private_note',
    'private_memo',
    'storage_path',
    'storage_bucket',
    'original_file_name'
  )
order by table_name, column_name;

select count(*) as non_approved_public_reports
from public.public_reports
where status <> 'approved';

-- 以下はpermission deniedになることを確認するための手動チェックです。
-- Supabase SQL Editorでは、1つずつコメントアウトを外して実行してください。
--
-- begin;
-- set local role anon;
-- select * from public.reports limit 1;
-- rollback;
--
-- begin;
-- set local role authenticated;
-- select reporter_email from public.reports limit 1;
-- rollback;
--
-- begin;
-- set local role anon;
-- select * from public.report_evidence_files limit 1;
-- rollback;
--
-- begin;
-- set local role anon;
-- select * from public.objections limit 1;
-- rollback;
--
-- begin;
-- set local role anon;
-- select * from public.submission_rate_limits limit 1;
-- rollback;
