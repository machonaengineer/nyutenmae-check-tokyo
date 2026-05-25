begin;

alter table public.profiles force row level security;
alter table public.areas force row level security;
alter table public.places force row level security;
alter table public.reports force row level security;
alter table public.report_evidence_files force row level security;
alter table public.risk_tags force row level security;
alter table public.report_risk_tags force row level security;
alter table public.objections force row level security;
alter table public.admin_actions force row level security;

update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
where id = 'report-evidence-files';

revoke all on table public.reports from anon, authenticated;
revoke all on table public.report_evidence_files from anon, authenticated;
revoke all on table public.objections from anon, authenticated;
revoke all on table public.admin_actions from anon, authenticated;

grant select on table public.public_reports to anon, authenticated;
grant select on table public.public_report_risk_tags to anon, authenticated;
grant select on table public.public_area_summaries to anon, authenticated;
grant select on table public.public_place_summaries to anon, authenticated;
grant select on table public.public_place_reports to anon, authenticated;

comment on table public.reports is
  'Private-by-default report table. Only approved records are exposed through public views.';
comment on table public.report_evidence_files is
  'Private evidence metadata. Evidence objects are stored in the private report-evidence-files bucket.';
comment on table public.objections is
  'Private objection records. Requester details are for admin review only.';
comment on view public.public_reports is
  'Public safe report view. Does not include reporter_email, private_note, or evidence file paths.';
comment on view public.public_place_summaries is
  'Public safe place summary view. Includes approved report aggregates only.';
comment on view public.public_place_reports is
  'Public safe place report view. Includes approved report summaries only.';

commit;
