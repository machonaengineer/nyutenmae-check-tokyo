begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.report_status as enum (
    'pending',
    'approved',
    'rejected',
    'needs_review',
    'hidden'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.evidence_level as enum (
    'S',
    'A',
    'B',
    'C',
    'D',
    'Hidden'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.objection_status as enum (
    'pending',
    'reviewing',
    'resolved',
    'rejected'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  center_label text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.areas(id) on delete restrict,
  shop_name text not null,
  address text,
  google_maps_url text,
  building_name text,
  floor text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (latitude is null or (latitude between -90 and 90)),
  check (longitude is null or (longitude between -180 and 180))
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.places(id) on delete set null,
  area_id uuid not null references public.areas(id) on delete restrict,
  status public.report_status not null default 'pending',
  evidence_level public.evidence_level not null default 'Hidden',
  shop_name text not null,
  address text,
  google_maps_url text,
  building_name text,
  floor text,
  visited_at timestamptz,
  party_size integer check (party_size is null or (party_size between 1 and 100)),
  was_solicited boolean,
  solicitation_description text,
  price_explained_before_entry boolean,
  explanation_inside_store text,
  actual_billed_amount integer check (
    actual_billed_amount is null or actual_billed_amount >= 0
  ),
  ordered_items text,
  fee_explanation_status text,
  receipt_available boolean,
  itemized_bill_available boolean,
  payment_method text,
  checkout_response text,
  exit_response text,
  felt_intimidated boolean,
  had_companions boolean,
  consulted_police boolean,
  consulted_consumer_center boolean,
  consulted_card_company boolean,
  reporter_email text not null,
  public_summary text not null,
  private_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_evidence_files (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  storage_bucket text not null default 'report-evidence-files',
  storage_path text not null unique,
  original_file_name text not null,
  content_type text not null,
  file_size_bytes integer not null check (
    file_size_bytes > 0 and file_size_bytes <= 5242880
  ),
  created_at timestamptz not null default now()
);

create table if not exists public.risk_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_risk_tags (
  report_id uuid not null references public.reports(id) on delete cascade,
  risk_tag_id uuid not null references public.risk_tags(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (report_id, risk_tag_id)
);

create table if not exists public.objections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete set null,
  target_url text,
  requester_name text,
  requester_email text not null,
  requester_relationship text,
  reason_category text not null,
  details text not null,
  status public.objection_status not null default 'pending',
  private_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_areas_updated_at on public.areas;
create trigger set_areas_updated_at
before update on public.areas
for each row execute function public.set_updated_at();

drop trigger if exists set_places_updated_at on public.places;
create trigger set_places_updated_at
before update on public.places
for each row execute function public.set_updated_at();

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

drop trigger if exists set_risk_tags_updated_at on public.risk_tags;
create trigger set_risk_tags_updated_at
before update on public.risk_tags
for each row execute function public.set_updated_at();

drop trigger if exists set_objections_updated_at on public.objections;
create trigger set_objections_updated_at
before update on public.objections
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data->>'name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.role = 'admin'
      from public.profiles p
      where p.id = auth.uid()
      limit 1
    ),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

insert into public.areas (slug, name, description, center_label, sort_order)
values
  (
    'shinjuku-kabukicho',
    '新宿・歌舞伎町',
    '客引き経由の来店、料金説明、会計確認に関する報告を扱います。',
    '新宿区歌舞伎町周辺',
    10
  ),
  (
    'ikebukuro',
    '池袋',
    '西口、東口周辺の入店前確認に役立つ注意情報を整理します。',
    '豊島区池袋周辺',
    20
  ),
  (
    'shibuya-dogenzaka-udagawacho',
    '渋谷・道玄坂・宇田川町',
    '繁華街での料金説明と会計内容の不一致報告を中心に扱います。',
    '渋谷区道玄坂、宇田川町周辺',
    30
  ),
  (
    'ueno-okachimachi-yushima',
    '上野・御徒町・湯島',
    '退店時対応や明細提示に関する注意報告を整理します。',
    '台東区、文京区の対象周辺',
    40
  )
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    center_label = excluded.center_label,
    sort_order = excluded.sort_order,
    is_active = true,
    updated_at = now();

insert into public.risk_tags (slug, label, sort_order)
values
  ('solicited-entry', '客引き経由の来店報告あり', 10),
  ('price-billing-mismatch', '料金説明と会計内容の不一致報告あり', 20),
  (
    'all-you-can-drink-condition-mismatch',
    '飲み放題条件の不一致報告あり',
    30
  ),
  (
    'seat-service-fee-insufficient-explanation',
    '席料・サービス料の説明不足報告あり',
    40
  ),
  ('itemized-bill-trouble', '明細提示に関するトラブル報告あり', 50),
  ('checkout-response-attention', '会計時対応に関する注意報告あり', 60),
  ('exit-response-attention', '退店時対応に関する注意報告あり', 70),
  ('high-billing-trouble', '高額請求トラブル報告あり', 80),
  ('similar-reports-same-address', '同一住所で類似報告あり', 90),
  ('objection-filed', '店舗側より異議申立てあり', 100),
  ('under-review', '確認中', 110)
on conflict (slug) do update
set label = excluded.label,
    sort_order = excluded.sort_order,
    is_active = true,
    updated_at = now();

create or replace view public.public_reports
with (security_barrier = true)
as
select
  r.id,
  r.place_id,
  r.area_id,
  a.slug as area_slug,
  a.name as area_name,
  r.status,
  r.evidence_level,
  r.shop_name,
  r.address,
  r.google_maps_url,
  r.building_name,
  r.floor,
  r.visited_at,
  r.party_size,
  r.was_solicited,
  r.price_explained_before_entry,
  r.actual_billed_amount,
  r.receipt_available,
  r.itemized_bill_available,
  r.payment_method,
  r.public_summary,
  r.created_at,
  r.updated_at
from public.reports r
join public.areas a on a.id = r.area_id
where r.status = 'approved';

create or replace view public.public_report_risk_tags
with (security_barrier = true)
as
select
  rrt.report_id,
  rt.id as risk_tag_id,
  rt.slug,
  rt.label,
  rt.sort_order
from public.report_risk_tags rrt
join public.risk_tags rt on rt.id = rrt.risk_tag_id
join public.reports r on r.id = rrt.report_id
where r.status = 'approved'
  and rt.is_active = true;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'report-evidence-files',
  'report-evidence-files',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles enable row level security;
alter table public.areas enable row level security;
alter table public.places enable row level security;
alter table public.reports enable row level security;
alter table public.report_evidence_files enable row level security;
alter table public.risk_tags enable row level security;
alter table public.report_risk_tags enable row level security;
alter table public.objections enable row level security;
alter table public.admin_actions enable row level security;

drop policy if exists "Profiles are readable by owner or admin" on public.profiles;
create policy "Profiles are readable by owner or admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Active areas are public" on public.areas;
create policy "Active areas are public"
on public.areas
for select
to anon, authenticated
using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage areas" on public.areas;
create policy "Admins can manage areas"
on public.areas
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Places with approved reports are public" on public.places;
create policy "Places with approved reports are public"
on public.places
for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.reports r
    where r.place_id = places.id
      and r.status = 'approved'
  )
);

drop policy if exists "Admins can manage places" on public.places;
create policy "Admins can manage places"
on public.places
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Only approved reports are selectable by policy" on public.reports;
create policy "Only approved reports are selectable by policy"
on public.reports
for select
to anon, authenticated
using (status = 'approved' or public.is_admin());

drop policy if exists "Admins can manage reports" on public.reports;
create policy "Admins can manage reports"
on public.reports
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read evidence file rows" on public.report_evidence_files;
create policy "Admins can read evidence file rows"
on public.report_evidence_files
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can manage evidence file rows" on public.report_evidence_files;
create policy "Admins can manage evidence file rows"
on public.report_evidence_files
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Active risk tags are public" on public.risk_tags;
create policy "Active risk tags are public"
on public.risk_tags
for select
to anon, authenticated
using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage risk tags" on public.risk_tags;
create policy "Admins can manage risk tags"
on public.risk_tags
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Approved report risk tags are public" on public.report_risk_tags;
create policy "Approved report risk tags are public"
on public.report_risk_tags
for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.reports r
    where r.id = report_risk_tags.report_id
      and r.status = 'approved'
  )
);

drop policy if exists "Admins can manage report risk tags" on public.report_risk_tags;
create policy "Admins can manage report risk tags"
on public.report_risk_tags
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage objections" on public.objections;
create policy "Admins can manage objections"
on public.objections
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read admin actions" on public.admin_actions;
create policy "Admins can read admin actions"
on public.admin_actions
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can write admin actions" on public.admin_actions;
create policy "Admins can write admin actions"
on public.admin_actions
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can read evidence objects" on storage.objects;
create policy "Admins can read evidence objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'report-evidence-files'
  and public.is_admin()
);

drop policy if exists "Admins can manage evidence objects" on storage.objects;
create policy "Admins can manage evidence objects"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'report-evidence-files'
  and public.is_admin()
)
with check (
  bucket_id = 'report-evidence-files'
  and public.is_admin()
);

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.areas from anon, authenticated;
revoke all on table public.places from anon, authenticated;
revoke all on table public.reports from anon, authenticated;
revoke all on table public.report_evidence_files from anon, authenticated;
revoke all on table public.risk_tags from anon, authenticated;
revoke all on table public.report_risk_tags from anon, authenticated;
revoke all on table public.objections from anon, authenticated;
revoke all on table public.admin_actions from anon, authenticated;

grant select on table public.areas to anon, authenticated;
grant select on table public.risk_tags to anon, authenticated;
grant select (
  id,
  area_id,
  shop_name,
  address,
  google_maps_url,
  building_name,
  floor,
  latitude,
  longitude,
  created_at,
  updated_at
) on table public.places to anon, authenticated;
grant select on table public.public_reports to anon, authenticated;
grant select on table public.public_report_risk_tags to anon, authenticated;
grant select on table public.profiles to authenticated;

create index if not exists areas_slug_idx on public.areas(slug);
create index if not exists places_area_id_idx on public.places(area_id);
create index if not exists reports_area_id_status_idx on public.reports(area_id, status);
create index if not exists reports_place_id_status_idx on public.reports(place_id, status);
create index if not exists reports_status_created_at_idx on public.reports(status, created_at desc);
create index if not exists report_evidence_files_report_id_idx
  on public.report_evidence_files(report_id);
create index if not exists risk_tags_slug_idx on public.risk_tags(slug);
create index if not exists report_risk_tags_risk_tag_id_idx
  on public.report_risk_tags(risk_tag_id);
create index if not exists objections_report_id_idx on public.objections(report_id);
create index if not exists admin_actions_target_idx
  on public.admin_actions(target_table, target_id);

commit;
