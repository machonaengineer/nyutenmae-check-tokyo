begin;

create table if not exists public.submission_rate_limits (
  id uuid primary key default gen_random_uuid(),
  form_kind text not null check (form_kind in ('report', 'objection')),
  key_type text not null check (key_type in ('ip', 'email')),
  key_hash text not null,
  window_start timestamptz not null default now(),
  attempt_count integer not null default 1 check (attempt_count > 0),
  last_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (form_kind, key_type, key_hash)
);

drop trigger if exists set_submission_rate_limits_updated_at on public.submission_rate_limits;
create trigger set_submission_rate_limits_updated_at
before update on public.submission_rate_limits
for each row execute function public.set_updated_at();

alter table public.submission_rate_limits enable row level security;
alter table public.submission_rate_limits force row level security;

drop policy if exists "Admins can read submission rate limits" on public.submission_rate_limits;
create policy "Admins can read submission rate limits"
on public.submission_rate_limits
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can manage submission rate limits" on public.submission_rate_limits;
create policy "Admins can manage submission rate limits"
on public.submission_rate_limits
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

revoke all on table public.submission_rate_limits from anon, authenticated;

create index if not exists submission_rate_limits_lookup_idx
  on public.submission_rate_limits(form_kind, key_type, key_hash);
create index if not exists submission_rate_limits_last_attempt_idx
  on public.submission_rate_limits(last_attempt_at desc);

comment on table public.submission_rate_limits is
  'Server-side simple rate limit state. Stores hashed IP/email keys only.';

commit;
