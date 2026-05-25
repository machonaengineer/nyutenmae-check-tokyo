begin;

grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;

alter default privileges in schema public
  grant usage, select on sequences to service_role;

grant usage on schema storage to service_role;
grant select, insert, update, delete on table storage.buckets to service_role;
grant select, insert, update, delete on table storage.objects to service_role;

comment on schema public is
  'Application schema. Browser access remains controlled by anon/authenticated grants, views, and RLS. service_role grants are server-only.';

commit;
