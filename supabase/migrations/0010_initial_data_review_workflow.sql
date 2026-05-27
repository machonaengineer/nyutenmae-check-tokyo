begin;

create table if not exists public.initial_data_review_candidates (
  id uuid primary key default gen_random_uuid(),
  source_type text not null
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
    ),
  source_url text,
  source_title text,
  source_checked_at date not null,
  observed_area text not null,
  place_name text,
  address text,
  building_name text,
  floor text,
  incident_type text not null,
  risk_tags text[] not null default '{}'::text[],
  evidence_level text not null default 'Hidden'
    check (evidence_level = 'Hidden'),
  public_summary text not null,
  private_memo text,
  proposed_status text not null default 'needs_review'
    check (proposed_status in ('pending', 'needs_review')),
  review_priority text not null default 'medium'
    check (review_priority in ('low', 'medium', 'high')),
  source_verified boolean not null default false,
  public_summary_checked boolean not null default false,
  building_checked boolean not null default false,
  legal_review_status text not null default 'not_started'
    check (legal_review_status in ('not_started', 'in_review', 'approved_for_import', 'rejected')),
  publish_decision text not null default 'undecided'
    check (publish_decision in ('undecided', 'needs_more_sources', 'import_private', 'reject')),
  review_note text,
  linked_report_id uuid references public.reports(id) on delete set null,
  created_by_admin uuid references auth.users(id) on delete set null,
  reviewed_by_admin uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_url is null or source_url ~* '^https?://'),
  check (char_length(public_summary) >= 20),
  check (place_name is not null or address is not null)
);

drop trigger if exists set_initial_data_review_candidates_updated_at
  on public.initial_data_review_candidates;
create trigger set_initial_data_review_candidates_updated_at
before update on public.initial_data_review_candidates
for each row execute function public.set_updated_at();

create unique index if not exists initial_data_review_candidates_dedupe_idx
  on public.initial_data_review_candidates (
    coalesce(source_url, ''),
    coalesce(place_name, ''),
    md5(public_summary)
  );

create index if not exists initial_data_review_candidates_workflow_idx
  on public.initial_data_review_candidates (
    publish_decision,
    legal_review_status,
    review_priority,
    created_at desc
  );

create index if not exists initial_data_review_candidates_location_idx
  on public.initial_data_review_candidates (
    observed_area,
    address,
    building_name
  );

alter table public.initial_data_review_candidates enable row level security;
alter table public.initial_data_review_candidates force row level security;

revoke all on table public.initial_data_review_candidates from anon, authenticated;
grant select, insert, update, delete on table public.initial_data_review_candidates to service_role;

comment on table public.initial_data_review_candidates is
  'Admin-only initial data review workflow. Candidates are not public reports and must remain non-public until explicitly imported and approved through the existing reports workflow.';

comment on column public.initial_data_review_candidates.private_memo is
  'Admin-only memo. Do not copy external article text, review text, personal data, evidence URLs, or storage paths.';

comment on column public.initial_data_review_candidates.publish_decision is
  'Admin workflow decision. import_private means create a non-public report only; it does not approve public display.';

commit;
