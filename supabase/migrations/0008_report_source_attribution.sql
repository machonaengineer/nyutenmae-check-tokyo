begin;

alter table public.reports
  add column if not exists source_type text not null default 'user_report',
  add column if not exists source_url text,
  add column if not exists source_title text,
  add column if not exists source_checked_at date;

alter table public.reports
  drop constraint if exists reports_source_type_check;

alter table public.reports
  add constraint reports_source_type_check
  check (
    source_type in (
      'user_report',
      'public_agency',
      'police',
      'consumer_center',
      'municipality',
      'news',
      'internal_tip',
      'external_review_trend',
      'other'
    )
  );

comment on column public.reports.source_type is
  'Public-safe source classification. Does not expose reporter email, private notes, evidence files, or copied external text.';
comment on column public.reports.source_url is
  'Public attribution URL for approved source-backed reports. External text must not be copied into this field.';
comment on column public.reports.source_title is
  'Public attribution title for approved source-backed reports.';
comment on column public.reports.source_checked_at is
  'Date the source was checked by an operator.';

update public.reports
set
  source_type = coalesce(
    nullif(substring(private_note from 'source_type: ([^\r\n]+)'), '未入力'),
    source_type
  ),
  source_url = coalesce(
    nullif(substring(private_note from 'source_url: ([^\r\n]+)'), '未入力'),
    source_url
  ),
  source_title = coalesce(
    nullif(substring(private_note from 'source_title: ([^\r\n]+)'), '未入力'),
    source_title
  ),
  source_checked_at = coalesce(
    case
      when substring(private_note from 'source_checked_at: ([0-9]{4}-[0-9]{2}-[0-9]{2})') is not null
      then substring(private_note from 'source_checked_at: ([0-9]{4}-[0-9]{2}-[0-9]{2})')::date
      else null
    end,
    source_checked_at
  )
where reporter_email = 'seed-data@nyutenmae-check.local'
  and private_note like '%初期データCSVから非公開投入%';

create or replace view public.public_place_reports
with (security_barrier = true)
as
select
  r.id,
  r.place_id,
  r.area_id,
  a.slug as area_slug,
  a.name as area_name,
  r.evidence_level::text as evidence_level,
  r.visited_at,
  r.created_at,
  coalesce(r.visited_at, r.created_at) as reported_at,
  r.was_solicited,
  r.price_explained_before_entry,
  r.actual_billed_amount,
  r.receipt_available,
  r.itemized_bill_available,
  r.payment_method,
  r.public_summary,
  r.source_type,
  r.source_url,
  r.source_title,
  r.source_checked_at
from public.reports r
join public.areas a on a.id = r.area_id
where r.status = 'approved'
  and a.is_active = true;

grant select on table public.public_place_reports to anon, authenticated;
grant select, insert, update, delete on table public.reports to service_role;

commit;
