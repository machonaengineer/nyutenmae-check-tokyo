begin;

alter table public.submission_rate_limits
  drop constraint if exists submission_rate_limits_key_type_check;

alter table public.submission_rate_limits
  add constraint submission_rate_limits_key_type_check
  check (key_type in ('ip', 'email', 'browser'));

comment on table public.submission_rate_limits is
  'Server-side simple rate limit state. Stores hashed IP/email/browser keys only.';

commit;
