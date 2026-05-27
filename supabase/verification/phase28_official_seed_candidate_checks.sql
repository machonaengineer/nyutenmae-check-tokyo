-- Phase 28 verification.
-- Run in Supabase SQL Editor after applying:
-- 1. supabase/migrations/0010_initial_data_review_workflow.sql
-- 2. supabase/migrations/0011_area_expansion.sql
--
-- Expected:
-- - candidate_table_exists = true
-- - expanded_area_count >= 2
-- - official source candidates are needs_review / Hidden / undecided
-- - anon and authenticated cannot directly select initial_data_review_candidates

select
  to_regclass('public.initial_data_review_candidates') is not null as candidate_table_exists,
  (
    select count(*)
    from public.areas
    where slug in ('roppongi-azabujuban', 'kichijoji')
  ) as expanded_area_count;

select
  count(*) as total_candidates,
  count(*) filter (where proposed_status = 'needs_review') as needs_review_count,
  count(*) filter (where evidence_level = 'Hidden') as hidden_count,
  count(*) filter (where publish_decision = 'undecided') as undecided_count,
  count(*) filter (where place_name like 'エリア注意情報%') as area_notice_count
from public.initial_data_review_candidates
where source_checked_at = date '2026-05-27';

select
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls_enabled,
  not has_table_privilege('anon', 'public.initial_data_review_candidates', 'select')
    as anon_cannot_select,
  not has_table_privilege('authenticated', 'public.initial_data_review_candidates', 'select')
    as authenticated_cannot_select,
  has_table_privilege('service_role', 'public.initial_data_review_candidates', 'select')
    as service_role_can_select
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'initial_data_review_candidates';

