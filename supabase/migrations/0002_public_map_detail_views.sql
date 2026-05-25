begin;

create or replace view public.public_area_summaries
with (security_barrier = true)
as
select
  a.id,
  a.slug,
  a.name,
  a.description,
  a.center_label,
  a.sort_order,
  count(distinct p.id)::integer as approved_place_count,
  count(r.id)::integer as approved_report_count,
  max(coalesce(r.visited_at, r.created_at)) as latest_reported_at
from public.areas a
left join public.reports r
  on r.area_id = a.id
  and r.status = 'approved'
left join public.places p
  on p.id = r.place_id
where a.is_active = true
group by
  a.id,
  a.slug,
  a.name,
  a.description,
  a.center_label,
  a.sort_order;

create or replace view public.public_place_summaries
with (security_barrier = true)
as
select
  p.id,
  p.area_id,
  a.slug as area_slug,
  a.name as area_name,
  p.shop_name,
  p.address,
  p.google_maps_url,
  p.building_name,
  p.floor,
  p.latitude,
  p.longitude,
  count(r.id)::integer as approved_report_count,
  max(coalesce(r.visited_at, r.created_at)) as latest_reported_at,
  array_remove(array_agg(distinct r.evidence_level::text), null) as evidence_levels,
  coalesce(
    (
      select array_agg(distinct rt.label)
      from public.report_risk_tags rrt
      join public.risk_tags rt on rt.id = rrt.risk_tag_id
      join public.reports tagged_reports on tagged_reports.id = rrt.report_id
      where tagged_reports.place_id = p.id
        and tagged_reports.status = 'approved'
        and rt.is_active = true
    ),
    '{}'::text[]
  ) as risk_tags,
  (array_agg(
    r.public_summary
    order by coalesce(r.visited_at, r.created_at) desc, r.created_at desc
  ))[1] as latest_public_summary
from public.places p
join public.areas a on a.id = p.area_id
join public.reports r
  on r.place_id = p.id
  and r.status = 'approved'
where a.is_active = true
group by
  p.id,
  p.area_id,
  a.slug,
  a.name,
  p.shop_name,
  p.address,
  p.google_maps_url,
  p.building_name,
  p.floor,
  p.latitude,
  p.longitude;

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
  r.public_summary
from public.reports r
join public.areas a on a.id = r.area_id
where r.status = 'approved'
  and a.is_active = true;

grant select on table public.public_area_summaries to anon, authenticated;
grant select on table public.public_place_summaries to anon, authenticated;
grant select on table public.public_place_reports to anon, authenticated;

commit;
