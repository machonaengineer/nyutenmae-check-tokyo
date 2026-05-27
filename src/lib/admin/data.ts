import "server-only";
import { EVIDENCE_BUCKET } from "@/lib/report-form";
import { SPONSOR_INQUIRY_ACTION } from "@/lib/sponsor-inquiry";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { ReportStatus } from "./types";

export type AdminReportListItem = {
  id: string;
  placeId: string;
  status: string;
  evidenceLevel: string;
  sourceType: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
  sourceCheckedAt: string | null;
  shopName: string;
  address: string | null;
  buildingName: string | null;
  floor: string | null;
  reporterEmail: string;
  publicSummary: string;
  createdAt: string;
  updatedAt: string;
  areaName: string;
};

export type AdminReportFilters = {
  status?: ReportStatus | "all";
  shopName?: string;
  address?: string;
  buildingName?: string;
  floor?: string;
};

export type AdminRiskTag = {
  id: string;
  slug: string;
  label: string;
};

export type AdminEvidenceFile = {
  id: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  signedUrl: string | null;
};

export type AdminActionLog = {
  id: string;
  action: string;
  summary: string | null;
  createdAt: string;
};

export type AdminExternalReviewSource = {
  id: string;
  slug: string;
  label: string;
  displayAllowedDefault: boolean;
  requiresAttribution: boolean;
  notes: string | null;
};

export type AdminExternalRatingSnapshot = {
  id: string;
  sourceId: string;
  sourceSlug: string;
  sourceLabel: string;
  ratingValue: number | null;
  ratingScale: number | null;
  ratingCount: number | null;
  checkedAt: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
  collectionMethod: string;
  displayAllowed: boolean;
  attributionLabel: string | null;
  publicNote: string | null;
  privateMemo: string | null;
  createdAt: string;
};

export type AdminReportDetail = {
  id: string;
  placeId: string;
  status: string;
  evidenceLevel: string;
  sourceType: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
  sourceCheckedAt: string | null;
  shopName: string;
  address: string | null;
  googleMapsUrl: string | null;
  buildingName: string | null;
  floor: string | null;
  visitedAt: string | null;
  partySize: number | null;
  wasSolicited: boolean | null;
  solicitationDescription: string | null;
  priceExplainedBeforeEntry: boolean | null;
  explanationInsideStore: string | null;
  actualBilledAmount: number | null;
  orderedItems: string | null;
  feeExplanationStatus: string | null;
  receiptAvailable: boolean | null;
  itemizedBillAvailable: boolean | null;
  paymentMethod: string | null;
  checkoutResponse: string | null;
  exitResponse: string | null;
  feltIntimidated: boolean | null;
  hadCompanions: boolean | null;
  consultedPolice: boolean | null;
  consultedConsumerCenter: boolean | null;
  consultedCardCompany: boolean | null;
  reporterEmail: string;
  publicSummary: string;
  privateNote: string | null;
  createdAt: string;
  updatedAt: string;
  areaName: string;
  selectedRiskTagIds: string[];
  evidenceFiles: AdminEvidenceFile[];
  externalRatings: AdminExternalRatingSnapshot[];
  actionLogs: AdminActionLog[];
};

export type AdminObjectionListItem = {
  id: string;
  reportId: string | null;
  targetUrl: string | null;
  requesterName: string | null;
  requesterEmail: string;
  requesterRelationship: string | null;
  reasonCategory: string;
  details: string;
  status: string;
  privateNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminSponsorInquiry = {
  id: string;
  organizationName: string;
  contactName: string | null;
  contactEmail: string;
  websiteUrl: string | null;
  sponsorType: string;
  budgetRange: string;
  message: string;
  createdAt: string;
};

export type AdminDashboardMetrics = {
  reportsTotal: number;
  pendingReports: number;
  needsReviewReports: number;
  approvedReports: number;
  hiddenReports: number;
  rejectedReports: number;
  stalePendingReports: number;
  objectionsTotal: number;
  pendingObjections: number;
  publicPlaces: number;
  evidenceFiles: number;
  externalRatings: number;
  externalRatingsPublic: number;
  sponsorInquiries: number;
  reportsByArea: { areaName: string; count: number }[];
  latestActions: AdminActionLog[];
};

export type AdminSimilarBuildingGroup = {
  key: string;
  address: string;
  buildingName: string;
  reports: AdminReportListItem[];
};

export type AdminQualityQueues = {
  missingBuildingReports: AdminReportListItem[];
  missingFloorReports: AdminReportListItem[];
  stalePendingReports: AdminReportListItem[];
  sourceNeedsReviewReports: AdminReportListItem[];
  openObjections: AdminObjectionListItem[];
  similarBuildingGroups: AdminSimilarBuildingGroup[];
};

export type AdminInitialDataReviewCandidate = {
  id: string;
  sourceType: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
  sourceCheckedAt: string;
  observedArea: string;
  placeName: string | null;
  address: string | null;
  buildingName: string | null;
  floor: string | null;
  incidentType: string;
  riskTags: string[];
  evidenceLevel: string;
  publicSummary: string;
  proposedStatus: string;
  reviewPriority: string;
  sourceVerified: boolean;
  publicSummaryChecked: boolean;
  buildingChecked: boolean;
  legalReviewStatus: string;
  publishDecision: string;
  reviewNote: string | null;
  linkedReportId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminInitialDataReviewWorkflow = {
  available: boolean;
  candidates: AdminInitialDataReviewCandidate[];
  metrics: {
    total: number;
    highPriority: number;
    sourceUnverified: number;
    legalPending: number;
    importReady: number;
    rejected: number;
  };
};

type AreaRow = { id: string; name: string };
type ReportListRow = {
  id: string;
  place_id: string;
  status: string;
  evidence_level: string;
  source_type: string | null;
  source_url: string | null;
  source_title: string | null;
  source_checked_at: string | null;
  shop_name: string;
  address: string | null;
  building_name: string | null;
  floor: string | null;
  reporter_email: string;
  public_summary: string;
  created_at: string;
  updated_at: string;
  area_id: string;
};

type ReportDetailRow = ReportListRow & {
  google_maps_url: string | null;
  building_name: string | null;
  floor: string | null;
  visited_at: string | null;
  party_size: number | null;
  was_solicited: boolean | null;
  solicitation_description: string | null;
  price_explained_before_entry: boolean | null;
  explanation_inside_store: string | null;
  actual_billed_amount: number | null;
  ordered_items: string | null;
  fee_explanation_status: string | null;
  receipt_available: boolean | null;
  itemized_bill_available: boolean | null;
  payment_method: string | null;
  checkout_response: string | null;
  exit_response: string | null;
  felt_intimidated: boolean | null;
  had_companions: boolean | null;
  consulted_police: boolean | null;
  consulted_consumer_center: boolean | null;
  consulted_card_company: boolean | null;
  private_note: string | null;
};

type ExternalReviewSourceRow = {
  id: string;
  slug: string;
  label: string;
  display_allowed_default: boolean;
  requires_attribution: boolean;
  notes: string | null;
};

type ExternalRatingSnapshotRow = {
  id: string;
  place_id: string;
  source_id: string;
  rating_value: number | string | null;
  rating_scale: number | string | null;
  rating_count: number | null;
  checked_at: string;
  source_url: string | null;
  source_title: string | null;
  collection_method: string;
  display_allowed: boolean;
  attribution_label: string | null;
  public_note: string | null;
  private_memo: string | null;
  created_at: string;
  external_review_sources:
    | {
        slug: string;
        label: string;
      }
    | {
        slug: string;
        label: string;
      }[]
    | null;
};

type DashboardReportRow = {
  status: string;
  evidence_level: string;
  area_id: string;
  created_at: string;
};

type DashboardObjectionRow = {
  status: string;
  created_at: string;
};

type DashboardPlaceSummaryRow = {
  id: string;
};

type DashboardEvidenceRow = {
  id: string;
};

type DashboardExternalRatingRow = {
  id: string;
  display_allowed: boolean;
};

type SponsorInquiryActionRow = {
  id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type InitialDataReviewCandidateRow = {
  id: string;
  source_type: string;
  source_url: string | null;
  source_title: string | null;
  source_checked_at: string;
  observed_area: string;
  place_name: string | null;
  address: string | null;
  building_name: string | null;
  floor: string | null;
  incident_type: string;
  risk_tags: string[] | null;
  evidence_level: string;
  public_summary: string;
  proposed_status: string;
  review_priority: string;
  source_verified: boolean;
  public_summary_checked: boolean;
  building_checked: boolean;
  legal_review_status: string;
  publish_decision: string;
  review_note: string | null;
  linked_report_id: string | null;
  created_at: string;
  updated_at: string;
};

function normalizeExternalReviewSource(
  source: ExternalRatingSnapshotRow["external_review_sources"],
) {
  if (Array.isArray(source)) {
    return source[0] ?? null;
  }

  return source;
}

function buildAreaMap(areas: AreaRow[]) {
  return new Map(areas.map((area) => [area.id, area.name]));
}

function normalizeAdminFilter(value: string | null | undefined) {
  return value?.trim().toLowerCase().slice(0, 80) ?? "";
}

function includesFilter(value: string | null, filter: string) {
  return !filter || (value ?? "").toLowerCase().includes(filter);
}

function mapAdminReportListItem(
  report: ReportListRow,
  areaNameMap: Map<string, string>,
): AdminReportListItem {
  return {
    id: report.id,
    placeId: report.place_id,
    status: report.status,
    evidenceLevel: report.evidence_level,
    sourceType: report.source_type ?? "user_report",
    sourceUrl: report.source_url,
    sourceTitle: report.source_title,
    sourceCheckedAt: report.source_checked_at,
    shopName: report.shop_name,
    address: report.address,
    buildingName: report.building_name,
    floor: report.floor,
    reporterEmail: report.reporter_email,
    publicSummary: report.public_summary,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
    areaName: areaNameMap.get(report.area_id) ?? "未設定",
  };
}

async function getAreaNameMap() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("areas").select("id,name");
  return buildAreaMap((data ?? []) as AreaRow[]);
}

export async function getAdminReports(filters: AdminReportFilters | ReportStatus | "all" = {}) {
  const normalizedFilters =
    typeof filters === "string" ? { status: filters } : filters;
  const shopNameFilter = normalizeAdminFilter(normalizedFilters.shopName);
  const addressFilter = normalizeAdminFilter(normalizedFilters.address);
  const buildingNameFilter = normalizeAdminFilter(normalizedFilters.buildingName);
  const floorFilter = normalizeAdminFilter(normalizedFilters.floor);
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("reports")
    .select(
      "id,place_id,status,evidence_level,source_type,source_url,source_title,source_checked_at,shop_name,address,building_name,floor,reporter_email,public_summary,created_at,updated_at,area_id",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (normalizedFilters.status && normalizedFilters.status !== "all") {
    query = query.eq("status", normalizedFilters.status);
  }

  const [{ data, error }, areaNameMap] = await Promise.all([query, getAreaNameMap()]);

  if (error) {
    throw error;
  }

  return ((data ?? []) as ReportListRow[])
    .map((report) => mapAdminReportListItem(report, areaNameMap))
    .filter((report) =>
      includesFilter(report.shopName, shopNameFilter) &&
      includesFilter(report.address, addressFilter) &&
      includesFilter(report.buildingName, buildingNameFilter) &&
      includesFilter(report.floor, floorFilter),
    );
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const supabase = createSupabaseAdminClient();
  const staleThreshold = Date.now() - 1000 * 60 * 60 * 24 * 7;

  const [
    reportsResult,
    objectionsResult,
    publicPlacesResult,
    evidenceResult,
    externalRatingsResult,
    sponsorInquiriesResult,
    actionRows,
    areaNameMap,
  ] = await Promise.all([
    supabase.from("reports").select("status,evidence_level,area_id,created_at"),
    supabase.from("objections").select("status,created_at"),
    supabase.from("public_place_summaries").select("id"),
    supabase.from("report_evidence_files").select("id"),
    supabase.from("external_rating_snapshots").select("id,display_allowed"),
    supabase
      .from("admin_actions")
      .select("id")
      .eq("action", SPONSOR_INQUIRY_ACTION),
    supabase
      .from("admin_actions")
      .select("id,action,summary,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    getAreaNameMap(),
  ]);

  const reports = ((reportsResult.data ?? []) as DashboardReportRow[]);
  const objections = ((objectionsResult.data ?? []) as DashboardObjectionRow[]);
  const publicPlaces = ((publicPlacesResult.data ?? []) as DashboardPlaceSummaryRow[]);
  const evidenceFiles = ((evidenceResult.data ?? []) as DashboardEvidenceRow[]);
  const externalRatings =
    ((externalRatingsResult.data ?? []) as DashboardExternalRatingRow[]);
  const sponsorInquiries = ((sponsorInquiriesResult.data ?? []) as { id: string }[]);
  const byArea = new Map<string, number>();

  for (const report of reports) {
    const areaName = areaNameMap.get(report.area_id) ?? "未設定";
    byArea.set(areaName, (byArea.get(areaName) ?? 0) + 1);
  }

  return {
    reportsTotal: reports.length,
    pendingReports: reports.filter((report) => report.status === "pending").length,
    needsReviewReports: reports.filter((report) => report.status === "needs_review")
      .length,
    approvedReports: reports.filter((report) => report.status === "approved").length,
    hiddenReports: reports.filter((report) => report.status === "hidden").length,
    rejectedReports: reports.filter((report) => report.status === "rejected").length,
    stalePendingReports: reports.filter(
      (report) =>
        report.status === "pending" &&
        new Date(report.created_at).getTime() < staleThreshold,
    ).length,
    objectionsTotal: objections.length,
    pendingObjections: objections.filter((objection) => objection.status === "pending")
      .length,
    publicPlaces: publicPlaces.length,
    evidenceFiles: evidenceFiles.length,
    externalRatings: externalRatings.length,
    externalRatingsPublic: externalRatings.filter((rating) => rating.display_allowed)
      .length,
    sponsorInquiries: sponsorInquiries.length,
    reportsByArea: [...byArea.entries()]
      .map(([areaName, count]) => ({ areaName, count }))
      .sort((a, b) => b.count - a.count),
    latestActions: ((actionRows.data ?? []) as {
      id: string;
      action: string;
      summary: string | null;
      created_at: string;
    }[]).map((action) => ({
      id: action.id,
      action: action.action,
      summary: action.summary,
      createdAt: action.created_at,
    })),
  };
}

function getReportAgeDays(createdAt: string) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
}

function getSimilarBuildingKey(report: AdminReportListItem) {
  if (!report.address || !report.buildingName) {
    return null;
  }

  return `${report.address.trim().toLowerCase()}::${report.buildingName.trim().toLowerCase()}`;
}

export async function getAdminQualityQueues(): Promise<AdminQualityQueues> {
  const [reports, objections] = await Promise.all([
    getAdminReports("all"),
    getAdminObjections(),
  ]);
  const buildingGroups = new Map<
    string,
    { address: string; buildingName: string; reports: AdminReportListItem[] }
  >();

  for (const report of reports) {
    const groupKey = getSimilarBuildingKey(report);

    if (!groupKey) {
      continue;
    }

    const current = buildingGroups.get(groupKey) ?? {
      address: report.address ?? "",
      buildingName: report.buildingName ?? "",
      reports: [],
    };
    current.reports.push(report);
    buildingGroups.set(groupKey, current);
  }

  return {
    missingBuildingReports: reports.filter(
      (report) => Boolean(report.address) && !report.buildingName,
    ),
    missingFloorReports: reports.filter(
      (report) => Boolean(report.buildingName) && !report.floor,
    ),
    stalePendingReports: reports.filter(
      (report) =>
        (report.status === "pending" || report.status === "needs_review") &&
        getReportAgeDays(report.createdAt) >= 7,
    ),
    sourceNeedsReviewReports: reports.filter(
      (report) =>
        report.sourceType !== "user_report" &&
        (!report.sourceUrl || !report.sourceCheckedAt || report.status !== "approved"),
    ),
    openObjections: objections.filter(
      (objection) => objection.status === "pending" || objection.status === "reviewing",
    ),
    similarBuildingGroups: [...buildingGroups.entries()]
      .map(([key, value]) => ({
        key,
        address: value.address,
        buildingName: value.buildingName,
        reports: value.reports,
      }))
      .filter((group) => group.reports.length > 1)
      .sort((left, right) => right.reports.length - left.reports.length),
  };
}

function emptyInitialDataReviewWorkflow(
  available: boolean,
): AdminInitialDataReviewWorkflow {
  return {
    available,
    candidates: [],
    metrics: {
      total: 0,
      highPriority: 0,
      sourceUnverified: 0,
      legalPending: 0,
      importReady: 0,
      rejected: 0,
    },
  };
}

function mapInitialDataReviewCandidate(
  candidate: InitialDataReviewCandidateRow,
): AdminInitialDataReviewCandidate {
  return {
    id: candidate.id,
    sourceType: candidate.source_type,
    sourceUrl: candidate.source_url,
    sourceTitle: candidate.source_title,
    sourceCheckedAt: candidate.source_checked_at,
    observedArea: candidate.observed_area,
    placeName: candidate.place_name,
    address: candidate.address,
    buildingName: candidate.building_name,
    floor: candidate.floor,
    incidentType: candidate.incident_type,
    riskTags: candidate.risk_tags ?? [],
    evidenceLevel: candidate.evidence_level,
    publicSummary: candidate.public_summary,
    proposedStatus: candidate.proposed_status,
    reviewPriority: candidate.review_priority,
    sourceVerified: candidate.source_verified,
    publicSummaryChecked: candidate.public_summary_checked,
    buildingChecked: candidate.building_checked,
    legalReviewStatus: candidate.legal_review_status,
    publishDecision: candidate.publish_decision,
    reviewNote: candidate.review_note,
    linkedReportId: candidate.linked_report_id,
    createdAt: candidate.created_at,
    updatedAt: candidate.updated_at,
  };
}

export async function getAdminInitialDataReviewWorkflow(): Promise<AdminInitialDataReviewWorkflow> {
  const supabase = createSupabaseAdminClient();

  try {
    const { data, error } = await supabase
      .from("initial_data_review_candidates")
      .select(
        "id,source_type,source_url,source_title,source_checked_at,observed_area,place_name,address,building_name,floor,incident_type,risk_tags,evidence_level,public_summary,proposed_status,review_priority,source_verified,public_summary_checked,building_checked,legal_review_status,publish_decision,review_note,linked_report_id,created_at,updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      throw error;
    }

    const candidates = ((data ?? []) as InitialDataReviewCandidateRow[]).map(
      mapInitialDataReviewCandidate,
    );

    return {
      available: true,
      candidates,
      metrics: {
        total: candidates.length,
        highPriority: candidates.filter((candidate) => candidate.reviewPriority === "high")
          .length,
        sourceUnverified: candidates.filter((candidate) => !candidate.sourceVerified)
          .length,
        legalPending: candidates.filter(
          (candidate) =>
            candidate.legalReviewStatus === "not_started" ||
            candidate.legalReviewStatus === "in_review",
        ).length,
        importReady: candidates.filter(
          (candidate) =>
            candidate.publishDecision === "import_private" &&
            candidate.legalReviewStatus === "approved_for_import" &&
            !candidate.linkedReportId,
        ).length,
        rejected: candidates.filter(
          (candidate) =>
            candidate.publishDecision === "reject" ||
            candidate.legalReviewStatus === "rejected",
        ).length,
      },
    };
  } catch {
    return emptyInitialDataReviewWorkflow(false);
  }
}

export async function getAdminRiskTags() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("risk_tags")
    .select("id,slug,label")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminRiskTag[];
}

function readMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" ? value : "";
}

export async function getAdminSponsorInquiries(): Promise<AdminSponsorInquiry[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_actions")
    .select("id,metadata,created_at")
    .eq("action", SPONSOR_INQUIRY_ACTION)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return ((data ?? []) as SponsorInquiryActionRow[]).map((row) => ({
    id: row.id,
    organizationName: readMetadataString(row.metadata, "organization_name"),
    contactName: readMetadataString(row.metadata, "contact_name") || null,
    contactEmail: readMetadataString(row.metadata, "contact_email"),
    websiteUrl: readMetadataString(row.metadata, "website_url") || null,
    sponsorType: readMetadataString(row.metadata, "sponsor_type"),
    budgetRange: readMetadataString(row.metadata, "budget_range"),
    message: readMetadataString(row.metadata, "message"),
    createdAt: row.created_at,
  }));
}

export async function getAdminExternalReviewSources() {
  const supabase = createSupabaseAdminClient();

  try {
    const { data, error } = await supabase
      .from("external_review_sources")
      .select("id,slug,label,display_allowed_default,requires_attribution,notes")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      throw error;
    }

    return ((data ?? []) as ExternalReviewSourceRow[]).map((source) => ({
      id: source.id,
      slug: source.slug,
      label: source.label,
      displayAllowedDefault: source.display_allowed_default,
      requiresAttribution: source.requires_attribution,
      notes: source.notes,
    }));
  } catch {
    return [];
  }
}

export async function getAdminExternalRatingSnapshots(placeId: string) {
  const supabase = createSupabaseAdminClient();

  try {
    const { data, error } = await supabase
      .from("external_rating_snapshots")
      .select(
        "id,place_id,source_id,rating_value,rating_scale,rating_count,checked_at,source_url,source_title,collection_method,display_allowed,attribution_label,public_note,private_memo,created_at,external_review_sources(slug,label)",
      )
      .eq("place_id", placeId)
      .order("checked_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as ExternalRatingSnapshotRow[]).map((snapshot) => {
      const source = normalizeExternalReviewSource(snapshot.external_review_sources);

      return {
        id: snapshot.id,
        sourceId: snapshot.source_id,
        sourceSlug: source?.slug ?? "unknown",
        sourceLabel: source?.label ?? "外部ソース",
        ratingValue:
          snapshot.rating_value === null ? null : Number(snapshot.rating_value),
        ratingScale:
          snapshot.rating_scale === null ? null : Number(snapshot.rating_scale),
        ratingCount: snapshot.rating_count,
        checkedAt: snapshot.checked_at,
        sourceUrl: snapshot.source_url,
        sourceTitle: snapshot.source_title,
        collectionMethod: snapshot.collection_method,
        displayAllowed: snapshot.display_allowed,
        attributionLabel: snapshot.attribution_label,
        publicNote: snapshot.public_note,
        privateMemo: snapshot.private_memo,
        createdAt: snapshot.created_at,
      };
    });
  } catch {
    return [];
  }
}

export async function getAdminReportDetail(id: string): Promise<AdminReportDetail | null> {
  const supabase = createSupabaseAdminClient();

  const [reportResult, areaNameMap, tagRows, evidenceRows, actionRows] =
    await Promise.all([
      supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single(),
      getAreaNameMap(),
      supabase.from("report_risk_tags").select("risk_tag_id").eq("report_id", id),
      supabase
        .from("report_evidence_files")
        .select("id,storage_path,original_file_name,content_type,file_size_bytes")
        .eq("report_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("admin_actions")
        .select("id,action,summary,created_at")
        .eq("target_table", "reports")
        .eq("target_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  if (reportResult.error || !reportResult.data) {
    return null;
  }

  const report = reportResult.data as ReportDetailRow;
  const externalRatings = await getAdminExternalRatingSnapshots(report.place_id);
  const evidenceFiles = await Promise.all(
    ((evidenceRows.data ?? []) as {
      id: string;
      storage_path: string;
      original_file_name: string;
      content_type: string;
      file_size_bytes: number;
    }[]).map(async (file) => {
      const { data } = await supabase.storage
        .from(EVIDENCE_BUCKET)
        .createSignedUrl(file.storage_path, 600);

      return {
        id: file.id,
        originalFileName: file.original_file_name,
        contentType: file.content_type,
        fileSizeBytes: file.file_size_bytes,
        signedUrl: data?.signedUrl ?? null,
      };
    }),
  );

  return {
    id: report.id,
    placeId: report.place_id,
    status: report.status,
    evidenceLevel: report.evidence_level,
    sourceType: report.source_type ?? "user_report",
    sourceUrl: report.source_url,
    sourceTitle: report.source_title,
    sourceCheckedAt: report.source_checked_at,
    shopName: report.shop_name,
    address: report.address,
    googleMapsUrl: report.google_maps_url,
    buildingName: report.building_name,
    floor: report.floor,
    visitedAt: report.visited_at,
    partySize: report.party_size,
    wasSolicited: report.was_solicited,
    solicitationDescription: report.solicitation_description,
    priceExplainedBeforeEntry: report.price_explained_before_entry,
    explanationInsideStore: report.explanation_inside_store,
    actualBilledAmount: report.actual_billed_amount,
    orderedItems: report.ordered_items,
    feeExplanationStatus: report.fee_explanation_status,
    receiptAvailable: report.receipt_available,
    itemizedBillAvailable: report.itemized_bill_available,
    paymentMethod: report.payment_method,
    checkoutResponse: report.checkout_response,
    exitResponse: report.exit_response,
    feltIntimidated: report.felt_intimidated,
    hadCompanions: report.had_companions,
    consultedPolice: report.consulted_police,
    consultedConsumerCenter: report.consulted_consumer_center,
    consultedCardCompany: report.consulted_card_company,
    reporterEmail: report.reporter_email,
    publicSummary: report.public_summary,
    privateNote: report.private_note,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
    areaName: areaNameMap.get(report.area_id) ?? "未設定",
    selectedRiskTagIds: ((tagRows.data ?? []) as { risk_tag_id: string }[]).map(
      (tag) => tag.risk_tag_id,
    ),
    evidenceFiles,
    externalRatings,
    actionLogs: ((actionRows.data ?? []) as {
      id: string;
      action: string;
      summary: string | null;
      created_at: string;
    }[]).map((action) => ({
      id: action.id,
      action: action.action,
      summary: action.summary,
      createdAt: action.created_at,
    })),
  };
}

export async function getAdminBuildingRelatedReports(report: AdminReportDetail) {
  if (!report.address && !report.buildingName) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("reports")
    .select(
      "id,place_id,status,evidence_level,source_type,source_url,source_title,source_checked_at,shop_name,address,building_name,floor,reporter_email,public_summary,created_at,updated_at,area_id",
    )
    .neq("id", report.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (report.address) {
    query = query.eq("address", report.address);
  }

  if (report.buildingName) {
    query = query.eq("building_name", report.buildingName);
  }

  const [{ data, error }, areaNameMap] = await Promise.all([query, getAreaNameMap()]);

  if (error) {
    throw error;
  }

  return ((data ?? []) as ReportListRow[]).map((relatedReport) =>
    mapAdminReportListItem(relatedReport, areaNameMap),
  );
}

export async function getAdminObjections() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("objections")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return ((data ?? []) as {
    id: string;
    report_id: string | null;
    target_url: string | null;
    requester_name: string | null;
    requester_email: string;
    requester_relationship: string | null;
    reason_category: string;
    details: string;
    status: string;
    private_note: string | null;
    created_at: string;
    updated_at: string;
  }[]).map((objection) => ({
    id: objection.id,
    reportId: objection.report_id,
    targetUrl: objection.target_url,
    requesterName: objection.requester_name,
    requesterEmail: objection.requester_email,
    requesterRelationship: objection.requester_relationship,
    reasonCategory: objection.reason_category,
    details: objection.details,
    status: objection.status,
    privateNote: objection.private_note,
    createdAt: objection.created_at,
    updatedAt: objection.updated_at,
  }));
}
