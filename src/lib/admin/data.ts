import "server-only";
import { EVIDENCE_BUCKET } from "@/lib/report-form";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { ReportStatus } from "./types";

export type AdminReportListItem = {
  id: string;
  status: string;
  evidenceLevel: string;
  shopName: string;
  address: string | null;
  reporterEmail: string;
  publicSummary: string;
  createdAt: string;
  updatedAt: string;
  areaName: string;
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

export type AdminReportDetail = {
  id: string;
  status: string;
  evidenceLevel: string;
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

type AreaRow = { id: string; name: string };
type ReportListRow = {
  id: string;
  status: string;
  evidence_level: string;
  shop_name: string;
  address: string | null;
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

function buildAreaMap(areas: AreaRow[]) {
  return new Map(areas.map((area) => [area.id, area.name]));
}

async function getAreaNameMap() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("areas").select("id,name");
  return buildAreaMap((data ?? []) as AreaRow[]);
}

export async function getAdminReports(status?: ReportStatus | "all") {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("reports")
    .select(
      "id,status,evidence_level,shop_name,address,reporter_email,public_summary,created_at,updated_at,area_id",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const [{ data, error }, areaNameMap] = await Promise.all([query, getAreaNameMap()]);

  if (error) {
    throw error;
  }

  return ((data ?? []) as ReportListRow[]).map((report) => ({
    id: report.id,
    status: report.status,
    evidenceLevel: report.evidence_level,
    shopName: report.shop_name,
    address: report.address,
    reporterEmail: report.reporter_email,
    publicSummary: report.public_summary,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
    areaName: areaNameMap.get(report.area_id) ?? "未設定",
  }));
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
    status: report.status,
    evidenceLevel: report.evidence_level,
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
