begin;

create table if not exists public.external_review_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  source_kind text not null default 'review_platform'
    check (source_kind in ('review_platform', 'public_agency', 'news', 'owned_tip', 'other')),
  base_url text,
  terms_url text,
  requires_attribution boolean not null default false,
  display_allowed_default boolean not null default false,
  notes text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.place_external_refs (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  source_id uuid not null references public.external_review_sources(id) on delete restrict,
  external_place_id text,
  source_url text,
  source_title text,
  collection_method text not null default 'manual'
    check (collection_method in ('manual', 'official_api', 'admin_note')),
  display_allowed boolean not null default false,
  private_memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (place_id, source_id, external_place_id),
  unique (place_id, source_id, source_url)
);

create table if not exists public.external_rating_snapshots (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  source_id uuid not null references public.external_review_sources(id) on delete restrict,
  external_ref_id uuid references public.place_external_refs(id) on delete set null,
  rating_value numeric(4, 2),
  rating_scale numeric(4, 2) not null default 5,
  rating_count integer,
  checked_at timestamptz not null,
  source_url text,
  source_title text,
  collection_method text not null default 'manual'
    check (collection_method in ('manual', 'official_api', 'admin_note')),
  display_allowed boolean not null default false,
  attribution_label text,
  public_note text,
  private_memo text,
  created_by_admin uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (rating_value is null or rating_value >= 0),
  check (rating_value is null or rating_value <= rating_scale),
  check (rating_scale > 0 and rating_scale <= 10),
  check (rating_count is null or rating_count >= 0),
  check (not display_allowed or source_url is not null),
  check (char_length(coalesce(public_note, '')) <= 240)
);

drop trigger if exists set_external_review_sources_updated_at on public.external_review_sources;
create trigger set_external_review_sources_updated_at
before update on public.external_review_sources
for each row execute function public.set_updated_at();

drop trigger if exists set_place_external_refs_updated_at on public.place_external_refs;
create trigger set_place_external_refs_updated_at
before update on public.place_external_refs
for each row execute function public.set_updated_at();

drop trigger if exists set_external_rating_snapshots_updated_at on public.external_rating_snapshots;
create trigger set_external_rating_snapshots_updated_at
before update on public.external_rating_snapshots
for each row execute function public.set_updated_at();

insert into public.external_review_sources (
  slug,
  label,
  source_kind,
  base_url,
  terms_url,
  requires_attribution,
  display_allowed_default,
  notes,
  sort_order
)
values
  (
    'google_maps',
    'Google マップ',
    'review_platform',
    'https://www.google.com/maps',
    'https://developers.google.com/maps/documentation/places/web-service/policies',
    true,
    true,
    '公式APIまたは管理者の目視確認に限定。口コミ本文、投稿者名、画像は保存しない。',
    10
  ),
  (
    'tabelog',
    '食べログ',
    'review_platform',
    'https://tabelog.com',
    'https://tabelog.com/help/rules/',
    false,
    false,
    '許諾確認まで公開表示しない。口コミ本文、画像、スクリーンショットの転載は禁止。点数も公開前に許諾と規約を確認する。',
    20
  ),
  (
    'other_review_site',
    'その他外部評価サイト',
    'review_platform',
    null,
    null,
    false,
    false,
    '各サイトの利用規約と許諾を確認してから公開可否を判断する。',
    90
  )
on conflict (slug) do update
set
  label = excluded.label,
  source_kind = excluded.source_kind,
  base_url = excluded.base_url,
  terms_url = excluded.terms_url,
  requires_attribution = excluded.requires_attribution,
  display_allowed_default = excluded.display_allowed_default,
  notes = excluded.notes,
  sort_order = excluded.sort_order,
  updated_at = now();

alter table public.external_review_sources enable row level security;
alter table public.place_external_refs enable row level security;
alter table public.external_rating_snapshots enable row level security;

alter table public.external_review_sources force row level security;
alter table public.place_external_refs force row level security;
alter table public.external_rating_snapshots force row level security;

drop policy if exists "Active external review sources are public" on public.external_review_sources;
create policy "Active external review sources are public"
on public.external_review_sources
for select
to anon, authenticated
using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage external review sources" on public.external_review_sources;
create policy "Admins can manage external review sources"
on public.external_review_sources
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage place external refs" on public.place_external_refs;
create policy "Admins can manage place external refs"
on public.place_external_refs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage external rating snapshots" on public.external_rating_snapshots;
create policy "Admins can manage external rating snapshots"
on public.external_rating_snapshots
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace view public.public_external_rating_snapshots
with (security_barrier = true)
as
select distinct on (ers.place_id, ers.source_id)
  ers.id,
  ers.place_id,
  ers.rating_value,
  ers.rating_scale,
  ers.rating_count,
  ers.checked_at,
  ers.source_url,
  ers.source_title,
  ers.collection_method,
  ers.attribution_label,
  ers.public_note,
  ers.created_at,
  erss.slug as source_slug,
  erss.label as source_label,
  erss.requires_attribution
from public.external_rating_snapshots ers
join public.external_review_sources erss
  on erss.id = ers.source_id
where ers.display_allowed = true
  and erss.is_active = true
  and exists (
    select 1
    from public.reports r
    where r.place_id = ers.place_id
      and r.status = 'approved'
  )
order by ers.place_id, ers.source_id, ers.checked_at desc, ers.created_at desc;

revoke all on table public.place_external_refs from anon, authenticated;
revoke all on table public.external_rating_snapshots from anon, authenticated;
revoke all on table public.public_external_rating_snapshots from anon, authenticated;

grant select on table public.external_review_sources to anon, authenticated;
grant select on table public.public_external_rating_snapshots to anon, authenticated;

grant select, insert, update, delete on table public.external_review_sources to service_role;
grant select, insert, update, delete on table public.place_external_refs to service_role;
grant select, insert, update, delete on table public.external_rating_snapshots to service_role;
grant select on table public.public_external_rating_snapshots to service_role;

create index if not exists place_external_refs_place_source_idx
  on public.place_external_refs(place_id, source_id);

create index if not exists external_rating_snapshots_place_checked_idx
  on public.external_rating_snapshots(place_id, checked_at desc);

create index if not exists external_rating_snapshots_display_idx
  on public.external_rating_snapshots(place_id, display_allowed, checked_at desc);

comment on table public.external_rating_snapshots is
  'External aggregate rating snapshots. Do not store review text, reviewer names, screenshots, or scraped HTML.';

commit;
