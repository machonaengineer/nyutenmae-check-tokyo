import { INITIAL_AREAS } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicAreaSummary = {
  id: string | null;
  slug: string;
  name: string;
  description: string;
  centerLabel: string;
  sortOrder: number;
  approvedPlaceCount: number;
  approvedReportCount: number;
  latestReportedAt: string | null;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

export type PublicPlaceSummary = {
  id: string;
  areaId: string | null;
  areaSlug: string;
  areaName: string;
  shopName: string;
  address: string | null;
  googleMapsUrl: string | null;
  buildingName: string | null;
  floor: string | null;
  latitude: number | null;
  longitude: number | null;
  approvedReportCount: number;
  latestReportedAt: string | null;
  evidenceLevels: string[];
  riskTags: string[];
  latestPublicSummary: string | null;
};

export type PublicPlaceReport = {
  id: string;
  placeId: string;
  evidenceLevel: string;
  sourceType: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
  sourceCheckedAt: string | null;
  visitedAt: string | null;
  createdAt: string;
  reportedAt: string;
  wasSolicited: boolean | null;
  priceExplainedBeforeEntry: boolean | null;
  actualBilledAmount: number | null;
  receiptAvailable: boolean | null;
  itemizedBillAvailable: boolean | null;
  paymentMethod: string | null;
  publicSummary: string;
};

export type PublicExternalRatingSnapshot = {
  id: string;
  placeId: string;
  sourceSlug: string;
  sourceLabel: string;
  ratingValue: number | null;
  ratingScale: number | null;
  ratingCount: number | null;
  checkedAt: string;
  sourceUrl: string;
  sourceTitle: string | null;
  collectionMethod: string;
  attributionLabel: string | null;
  publicNote: string | null;
  requiresAttribution: boolean;
};

export type PublicPlaceDetail = {
  place: PublicPlaceSummary;
  reports: PublicPlaceReport[];
  externalRatings: PublicExternalRatingSnapshot[];
};

type PublicAreaSummaryRow = {
  id: string | null;
  slug: string;
  name: string;
  description: string | null;
  center_label: string | null;
  sort_order: number | null;
  approved_place_count: number | null;
  approved_report_count: number | null;
  latest_reported_at: string | null;
};

type PublicPlaceSummaryRow = {
  id: string;
  area_id: string | null;
  area_slug: string;
  area_name: string;
  shop_name: string;
  address: string | null;
  google_maps_url: string | null;
  building_name: string | null;
  floor: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  approved_report_count: number | null;
  latest_reported_at: string | null;
  evidence_levels: string[] | null;
  risk_tags: string[] | null;
  latest_public_summary: string | null;
};

type PublicPlaceReportRow = {
  id: string;
  place_id: string;
  evidence_level: string;
  source_type: string | null;
  source_url: string | null;
  source_title: string | null;
  source_checked_at: string | null;
  visited_at: string | null;
  created_at: string;
  reported_at: string;
  was_solicited: boolean | null;
  price_explained_before_entry: boolean | null;
  actual_billed_amount: number | null;
  receipt_available: boolean | null;
  itemized_bill_available: boolean | null;
  payment_method: string | null;
  public_summary: string;
};

type PublicExternalRatingSnapshotRow = {
  id: string;
  place_id: string;
  source_slug: string;
  source_label: string;
  rating_value: number | string | null;
  rating_scale: number | string | null;
  rating_count: number | null;
  checked_at: string;
  source_url: string;
  source_title: string | null;
  collection_method: string;
  attribution_label: string | null;
  public_note: string | null;
  requires_attribution: boolean;
};

const TOKYO_CENTER = { latitude: 35.6895, longitude: 139.6917 };

function getStaticArea(slug: string) {
  return INITIAL_AREAS.find((area) => area.slug === slug);
}

function toNumberOrNull(value: number | string | null) {
  if (value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapArea(row: PublicAreaSummaryRow): PublicAreaSummary {
  const staticArea = getStaticArea(row.slug);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? staticArea?.summary ?? "",
    centerLabel: row.center_label ?? staticArea?.center ?? "",
    sortOrder: row.sort_order ?? 0,
    approvedPlaceCount: row.approved_place_count ?? 0,
    approvedReportCount: row.approved_report_count ?? 0,
    latestReportedAt: row.latest_reported_at,
    coordinates: staticArea?.coordinates ?? TOKYO_CENTER,
  };
}

function mapPlace(row: PublicPlaceSummaryRow): PublicPlaceSummary {
  return {
    id: row.id,
    areaId: row.area_id,
    areaSlug: row.area_slug,
    areaName: row.area_name,
    shopName: row.shop_name,
    address: row.address,
    googleMapsUrl: row.google_maps_url,
    buildingName: row.building_name,
    floor: row.floor,
    latitude: toNumberOrNull(row.latitude),
    longitude: toNumberOrNull(row.longitude),
    approvedReportCount: row.approved_report_count ?? 0,
    latestReportedAt: row.latest_reported_at,
    evidenceLevels: row.evidence_levels ?? [],
    riskTags: row.risk_tags ?? [],
    latestPublicSummary: row.latest_public_summary,
  };
}

function mapReport(row: PublicPlaceReportRow): PublicPlaceReport {
  return {
    id: row.id,
    placeId: row.place_id,
    evidenceLevel: row.evidence_level,
    sourceType: row.source_type ?? "user_report",
    sourceUrl: row.source_url,
    sourceTitle: row.source_title,
    sourceCheckedAt: row.source_checked_at,
    visitedAt: row.visited_at,
    createdAt: row.created_at,
    reportedAt: row.reported_at,
    wasSolicited: row.was_solicited,
    priceExplainedBeforeEntry: row.price_explained_before_entry,
    actualBilledAmount: row.actual_billed_amount,
    receiptAvailable: row.receipt_available,
    itemizedBillAvailable: row.itemized_bill_available,
    paymentMethod: row.payment_method,
    publicSummary: row.public_summary,
  };
}

function mapExternalRating(
  row: PublicExternalRatingSnapshotRow,
): PublicExternalRatingSnapshot {
  return {
    id: row.id,
    placeId: row.place_id,
    sourceSlug: row.source_slug,
    sourceLabel: row.source_label,
    ratingValue: toNumberOrNull(row.rating_value),
    ratingScale: toNumberOrNull(row.rating_scale),
    ratingCount: row.rating_count,
    checkedAt: row.checked_at,
    sourceUrl: row.source_url,
    sourceTitle: row.source_title,
    collectionMethod: row.collection_method,
    attributionLabel: row.attribution_label,
    publicNote: row.public_note,
    requiresAttribution: row.requires_attribution,
  };
}

function getStaticAreaSummaries(): PublicAreaSummary[] {
  return INITIAL_AREAS.map((area, index) => ({
    id: null,
    slug: area.slug,
    name: area.name,
    description: area.summary,
    centerLabel: area.center,
    sortOrder: (index + 1) * 10,
    approvedPlaceCount: 0,
    approvedReportCount: 0,
    latestReportedAt: null,
    coordinates: area.coordinates,
  }));
}

export async function getPublicAreaSummaries() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("public_area_summaries")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data) {
      throw error;
    }

    return (data as PublicAreaSummaryRow[]).map(mapArea);
  } catch {
    return getStaticAreaSummaries();
  }
}

export async function getPublicAreaSummary(slug: string) {
  const areas = await getPublicAreaSummaries();
  return areas.find((area) => area.slug === slug) ?? null;
}

export async function getPublicPlaceSummaries(options: { areaSlug?: string } = {}) {
  try {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("public_place_summaries")
      .select("*")
      .order("latest_reported_at", { ascending: false });

    if (options.areaSlug) {
      query = query.eq("area_slug", options.areaSlug);
    }

    const { data, error } = await query;

    if (error || !data) {
      throw error;
    }

    return (data as PublicPlaceSummaryRow[]).map(mapPlace);
  } catch {
    return [];
  }
}

export function filterPublicPlacesByQuery(places: PublicPlaceSummary[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return places.filter((place) => {
    const searchableText = [
      place.shopName,
      place.address,
      place.buildingName,
      place.floor,
      place.areaName,
      ...place.riskTags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return terms.every((term) => searchableText.includes(term));
  });
}

export async function getPublicPlaceDetail(id: string): Promise<PublicPlaceDetail | null> {
  try {
    const supabase = createSupabaseServerClient();
    const [placeResult, reportsResult, externalRatingsResult] = await Promise.all([
      supabase.from("public_place_summaries").select("*").eq("id", id).single(),
      supabase
        .from("public_place_reports")
        .select("*")
        .eq("place_id", id)
        .order("reported_at", { ascending: false }),
      supabase
        .from("public_external_rating_snapshots")
        .select("*")
        .eq("place_id", id)
        .order("checked_at", { ascending: false }),
    ]);

    if (placeResult.error || reportsResult.error || !placeResult.data) {
      return null;
    }

    return {
      place: mapPlace(placeResult.data as PublicPlaceSummaryRow),
      reports: ((reportsResult.data ?? []) as PublicPlaceReportRow[]).map(mapReport),
      externalRatings: externalRatingsResult.error
        ? []
        : ((externalRatingsResult.data ?? []) as PublicExternalRatingSnapshotRow[]).map(
            mapExternalRating,
          ),
    };
  } catch {
    return null;
  }
}

export function getAreaCenter(slug?: string) {
  if (!slug) {
    return TOKYO_CENTER;
  }

  return getStaticArea(slug)?.coordinates ?? TOKYO_CENTER;
}

export function getPlaceDisplayName(place: Pick<PublicPlaceSummary, "shopName" | "address">) {
  return place.shopName || place.address || "名称未設定の場所";
}
