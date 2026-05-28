"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin/auth";
import { getInitialDataCandidateCsv } from "@/lib/admin/initial-data-candidates";
import { getMediaEvidenceCandidateCsv } from "@/lib/admin/media-evidence-candidates";
import { getOfficialAreaSeedCandidateCsv } from "@/lib/admin/official-area-seed-candidates";
import {
  isInitialDataLegalReviewStatus,
  isInitialDataPublishDecision,
  isInitialDataReviewPriority,
} from "@/lib/admin/types";
import { containsDangerousExpression } from "@/lib/content-safety";
import {
  containsExternalCopyRiskText,
  containsNonPublicTextMarker,
  parseCsv,
  validateInitialDataCsv,
} from "@/lib/initial-data-validation";
import { isReportSourceType } from "@/lib/report-sources";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type InitialDataImportState = {
  status: "idle" | "success" | "error";
  message: string;
  importedCount: number;
  skippedCount: number;
  errors: string[];
};

export type InitialDataCandidateStageState = {
  status: "idle" | "success" | "error";
  message: string;
  stagedCount: number;
  skippedCount: number;
  errors: string[];
};

type AreaRow = {
  id: string;
  slug: string;
  name: string;
};

type RiskTagRow = {
  id: string;
  slug: string;
  label: string;
};

type InitialDataRow = Record<string, string>;
type InitialDataReviewCandidateImportRow = {
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
  private_memo: string | null;
  proposed_status: string;
  source_verified: boolean;
  public_summary_checked: boolean;
  building_checked: boolean;
  legal_review_status: string;
  publish_decision: string;
  linked_report_id: string | null;
};

const INTERNAL_SEED_EMAIL = "seed-data@nyutenmae-check.local";
const IMPORTABLE_STATUSES = new Set(["pending", "needs_review"]);
const IMPORT_EVIDENCE_LEVEL = "Hidden";

function getFormText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFormCheckbox(formData: FormData, key: string) {
  return getFormText(formData, key) === "on";
}

function getText(row: InitialDataRow, key: string) {
  return (row[key] ?? "").trim();
}

function splitRiskTags(value: string) {
  return value
    .split(/[;；,、\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function findArea(row: InitialDataRow, areas: AreaRow[]) {
  const observedArea = getText(row, "observed_area");

  return areas.find(
    (area) => area.slug === observedArea || area.name === observedArea,
  );
}

function buildPrivateNote(row: InitialDataRow, adminEmail: string) {
  const lines = [
    "初期データCSVから非公開投入。",
    `source_type: ${getText(row, "source_type") || "未入力"}`,
    `source_url: ${getText(row, "source_url") || "未入力"}`,
    `source_title: ${getText(row, "source_title") || "未入力"}`,
    `source_checked_at: ${getText(row, "source_checked_at") || "未入力"}`,
    `incident_type: ${getText(row, "incident_type") || "未入力"}`,
    `private_memo: ${getText(row, "private_memo") || "未入力"}`,
    `csv_status: ${getText(row, "status") || "未入力"}`,
    `csv_evidence_level: ${getText(row, "evidence_level") || "未入力"}`,
    `reviewed_by_admin: ${getText(row, "reviewed_by_admin") || adminEmail}`,
    `published_at: ${getText(row, "published_at") || "未公開"}`,
  ];

  return lines.join("\n");
}

function buildRowErrors(options: {
  row: InitialDataRow;
  lineNumber: number;
  area: AreaRow | undefined;
  riskTagLabels: string[];
  riskTagMap: Map<string, RiskTagRow>;
}) {
  const errors: string[] = [];
  const { row, lineNumber, area, riskTagLabels, riskTagMap } = options;
  const status = getText(row, "status");
  const evidenceLevel = getText(row, "evidence_level");
  const publicSummary = getText(row, "public_summary");
  const privateMemo = getText(row, "private_memo");
  const placeName = getText(row, "place_name");
  const address = getText(row, "address");
  const sourceType = getText(row, "source_type");
  const sourceUrl = getText(row, "source_url");
  const sourceTitle = getText(row, "source_title");
  const sourceCheckedAt = getText(row, "source_checked_at");

  if (!area) {
    errors.push(`${lineNumber}行目: observed_area が掲載対象エリアと一致しません。`);
  }

  if (!IMPORTABLE_STATUSES.has(status)) {
    errors.push(
      `${lineNumber}行目: status は pending または needs_review のみ投入できます。`,
    );
  }

  if (evidenceLevel !== IMPORT_EVIDENCE_LEVEL) {
    errors.push(`${lineNumber}行目: evidence_level は Hidden のみ投入できます。`);
  }

  if (!placeName && !address) {
    errors.push(`${lineNumber}行目: place_name または address のどちらかが必要です。`);
  }

  if (!sourceType) {
    errors.push(`${lineNumber}行目: source_type が必要です。`);
  }

  if (sourceType && !isReportSourceType(sourceType)) {
    errors.push(`${lineNumber}行目: source_type が許可値ではありません。`);
  }

  if (sourceUrl && !/^https?:\/\/.+/i.test(sourceUrl)) {
    errors.push(`${lineNumber}行目: source_url は http(s) URL にしてください。`);
  }

  if (!sourceCheckedAt) {
    errors.push(`${lineNumber}行目: source_checked_at が必要です。`);
  }

  if (sourceCheckedAt && !/^\d{4}-\d{2}-\d{2}$/.test(sourceCheckedAt)) {
    errors.push(`${lineNumber}行目: source_checked_at は YYYY-MM-DD にしてください。`);
  }

  if (!getText(row, "incident_type")) {
    errors.push(`${lineNumber}行目: incident_type が必要です。`);
  }

  if (publicSummary.length < 20) {
    errors.push(`${lineNumber}行目: public_summary は20文字以上にしてください。`);
  }

  if (containsDangerousExpression(publicSummary)) {
    errors.push(`${lineNumber}行目: public_summary に危険表現が含まれています。`);
  }

  if (containsDangerousExpression(sourceTitle)) {
    errors.push(`${lineNumber}行目: source_title に危険表現が含まれています。`);
  }

  if (containsNonPublicTextMarker(publicSummary)) {
    errors.push(`${lineNumber}行目: public_summary に非公開情報を示す文字列があります。`);
  }

  if (containsNonPublicTextMarker(sourceTitle)) {
    errors.push(`${lineNumber}行目: source_title に非公開情報を示す文字列があります。`);
  }

  if (
    containsExternalCopyRiskText(publicSummary) ||
    containsExternalCopyRiskText(privateMemo)
  ) {
    errors.push(`${lineNumber}行目: 外部本文の転載に見える表現があります。`);
  }

  for (const label of riskTagLabels) {
    if (!riskTagMap.has(label)) {
      errors.push(`${lineNumber}行目: risk_tags に未登録のタグがあります: ${label}`);
    }
  }

  return errors;
}

async function findOrCreatePlace(options: {
  areaId: string;
  shopName: string;
  address: string | null;
  buildingName: string | null;
  floor: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("places")
    .select("id")
    .eq("area_id", options.areaId)
    .eq("shop_name", options.shopName)
    .limit(1);

  if (options.address) {
    query = query.eq("address", options.address);
  }

  const existing = await query.maybeSingle();

  if (existing.data?.id) {
    return existing.data.id as string;
  }

  const { data, error } = await supabase
    .from("places")
    .insert({
      area_id: options.areaId,
      shop_name: options.shopName,
      address: options.address,
      building_name: options.buildingName,
      floor: options.floor,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw error ?? new Error("Place insert failed.");
  }

  return data.id as string;
}

async function hasDuplicateSeedReport(options: {
  areaId: string;
  shopName: string;
  publicSummary: string;
}) {
  return Boolean(await findDuplicateSeedReportId(options));
}

async function findDuplicateSeedReportId(options: {
  areaId: string;
  shopName: string;
  publicSummary: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("reports")
    .select("id")
    .eq("area_id", options.areaId)
    .eq("shop_name", options.shopName)
    .eq("public_summary", options.publicSummary)
    .limit(1)
    .maybeSingle();

  return (data?.id as string | undefined) ?? null;
}

async function hasDuplicateReviewCandidate(options: {
  sourceUrl: string | null;
  placeName: string;
  publicSummary: string;
}) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("initial_data_review_candidates")
    .select("id")
    .eq("place_name", options.placeName)
    .eq("public_summary", options.publicSummary)
    .limit(1);

  if (options.sourceUrl) {
    query = query.eq("source_url", options.sourceUrl);
  }

  const { data } = await query.maybeSingle();
  return Boolean(data?.id);
}

async function writeDataAdminAction(options: {
  adminUserId: string;
  action: string;
  targetTable: string;
  targetId: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("admin_actions").insert({
    admin_user_id: options.adminUserId,
    action: options.action,
    target_table: options.targetTable,
    target_id: options.targetId,
    summary: options.summary,
    metadata: options.metadata ?? {},
  });
}

function buildPrivateNoteFromCandidate(
  candidate: InitialDataReviewCandidateImportRow,
  adminEmail: string,
) {
  const lines = [
    "初期データ候補審査DBから非公開投入。",
    `source_type: ${candidate.source_type}`,
    `source_url: ${candidate.source_url ?? "未入力"}`,
    `source_title: ${candidate.source_title ?? "未入力"}`,
    `source_checked_at: ${candidate.source_checked_at}`,
    `incident_type: ${candidate.incident_type}`,
    `private_memo: ${candidate.private_memo ?? "未入力"}`,
    `candidate_id: ${candidate.id}`,
    `candidate_status: ${candidate.proposed_status}`,
    `reviewed_by_admin: ${adminEmail}`,
    "公開承認ではありません。投稿詳細で別途、人間が承認してください。",
  ];

  return lines.join("\n");
}

function getCandidateImportErrors(candidate: InitialDataReviewCandidateImportRow) {
  const errors: string[] = [];

  if (candidate.linked_report_id) {
    errors.push("すでに非公開投稿へ紐付いています。");
  }

  if (!IMPORTABLE_STATUSES.has(candidate.proposed_status)) {
    errors.push("proposed_status は pending または needs_review のみ投入できます。");
  }

  if (candidate.evidence_level !== IMPORT_EVIDENCE_LEVEL) {
    errors.push("evidence_level は Hidden のみ投入できます。");
  }

  if (!candidate.source_verified) {
    errors.push("出典URL・確認日の確認が未完了です。");
  }

  if (!candidate.public_summary_checked) {
    errors.push("公開サマリーの独自要約確認が未完了です。");
  }

  if (!candidate.building_checked) {
    errors.push("住所・建物・階数の確認が未完了です。");
  }

  if (candidate.legal_review_status !== "approved_for_import") {
    errors.push("法務・表現確認が非公開投入可になっていません。");
  }

  if (candidate.publish_decision !== "import_private") {
    errors.push("判断が非公開投入へになっていません。");
  }

  if (!candidate.place_name && !candidate.address) {
    errors.push("place_name または address のどちらかが必要です。");
  }

  if (!isReportSourceType(candidate.source_type)) {
    errors.push("source_type が許可値ではありません。");
  }

  if (containsDangerousExpression(candidate.public_summary)) {
    errors.push("公開サマリーに危険表現が含まれています。");
  }

  if (containsDangerousExpression(candidate.source_title ?? "")) {
    errors.push("出典タイトルに危険表現が含まれています。");
  }

  if (
    containsNonPublicTextMarker(candidate.public_summary) ||
    containsNonPublicTextMarker(candidate.source_title ?? "")
  ) {
    errors.push("公開される項目に非公開情報を示す文字列が含まれています。");
  }

  if (
    containsExternalCopyRiskText(candidate.public_summary) ||
    containsExternalCopyRiskText(candidate.private_memo ?? "")
  ) {
    errors.push("外部本文の転載に見える表現があります。");
  }

  return errors;
}

export async function stageInitialDataCandidatesAction(
  _prevState: InitialDataCandidateStageState,
  formData: FormData,
): Promise<InitialDataCandidateStageState> {
  const adminUser = await requireAdminUser();
  const csv = getFormText(formData, "csv");
  const reviewPriority = getFormText(formData, "review_priority") || "medium";

  if (!isInitialDataReviewPriority(reviewPriority)) {
    return {
      status: "error",
      message: "優先度が不正です。",
      stagedCount: 0,
      skippedCount: 0,
      errors: ["review_priority は low / medium / high から選んでください。"],
    };
  }

  if (!csv.trim()) {
    return {
      status: "error",
      message: "CSVを入力してください。",
      stagedCount: 0,
      skippedCount: 0,
      errors: ["CSVが空です。"],
    };
  }

  const validation = validateInitialDataCsv(csv);
  const structuralErrors = validation.issues
    .filter((issue) => issue.severity === "error")
    .map((issue) => `${issue.row}行目 ${issue.column}: ${issue.message}`);
  const { rows } = parseCsv(csv);

  if (rows.length === 0) {
    structuralErrors.push("登録対象のデータ行がありません。");
  }

  if (structuralErrors.length > 0) {
    return {
      status: "error",
      message: "CSVのエラーを修正してから審査DBへ登録してください。",
      stagedCount: 0,
      skippedCount: 0,
      errors: structuralErrors.slice(0, 20),
    };
  }

  const supabase = createSupabaseAdminClient();
  const [areasResult, riskTagsResult] = await Promise.all([
    supabase
      .from("areas")
      .select("id,slug,name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("risk_tags")
      .select("id,slug,label")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (areasResult.error || riskTagsResult.error) {
    return {
      status: "error",
      message: "管理用マスタを取得できませんでした。",
      stagedCount: 0,
      skippedCount: 0,
      errors: ["areas または risk_tags の取得に失敗しました。"],
    };
  }

  const areas = (areasResult.data ?? []) as AreaRow[];
  const riskTags = (riskTagsResult.data ?? []) as RiskTagRow[];
  const riskTagMap = new Map<string, RiskTagRow>();

  for (const tag of riskTags) {
    riskTagMap.set(tag.slug, tag);
    riskTagMap.set(tag.label, tag);
  }

  const rowErrors = rows.flatMap((row, index) => {
    const riskTagLabels = splitRiskTags(getText(row, "risk_tags"));

    return buildRowErrors({
      row,
      lineNumber: index + 2,
      area: findArea(row, areas),
      riskTagLabels,
      riskTagMap,
    });
  });

  if (rowErrors.length > 0) {
    return {
      status: "error",
      message: "審査DB登録の条件を満たさない行があります。",
      stagedCount: 0,
      skippedCount: 0,
      errors: rowErrors.slice(0, 30),
    };
  }

  let stagedCount = 0;
  let skippedCount = 0;

  try {
    for (const row of rows) {
      const placeName =
        getText(row, "place_name") || getText(row, "address") || "名称未確認";
      const sourceUrl = getText(row, "source_url") || null;
      const publicSummary = getText(row, "public_summary");

      const isDuplicate = await hasDuplicateReviewCandidate({
        sourceUrl,
        placeName,
        publicSummary,
      });

      if (isDuplicate) {
        skippedCount += 1;
        continue;
      }

      const { error } = await supabase.from("initial_data_review_candidates").insert({
        source_type: getText(row, "source_type") || "other",
        source_url: sourceUrl,
        source_title: getText(row, "source_title") || null,
        source_checked_at: getText(row, "source_checked_at"),
        observed_area: getText(row, "observed_area"),
        place_name: placeName,
        address: getText(row, "address") || null,
        building_name: getText(row, "building_name") || null,
        floor: getText(row, "floor") || null,
        incident_type: getText(row, "incident_type"),
        risk_tags: splitRiskTags(getText(row, "risk_tags")),
        evidence_level: IMPORT_EVIDENCE_LEVEL,
        public_summary: publicSummary,
        private_memo: getText(row, "private_memo") || null,
        proposed_status: getText(row, "status") || "needs_review",
        review_priority: reviewPriority,
        created_by_admin: adminUser.id,
      });

      if (error) {
        throw error;
      }

      stagedCount += 1;
    }
  } catch {
    return {
      status: "error",
      message:
        "審査DBへの登録中にエラーが発生しました。0010 migration の適用状況を確認してください。",
      stagedCount,
      skippedCount,
      errors: ["一部の候補だけ登録されている可能性があります。重複候補は次回登録時にスキップされます。"],
    };
  }

  await writeDataAdminAction({
    adminUserId: adminUser.id,
    action: "initial_data_candidates_staged",
    targetTable: "initial_data_review_candidates",
    targetId: null,
    summary: `初期データ候補を審査DBへ${stagedCount}件登録しました。`,
    metadata: {
      staged_count: stagedCount,
      skipped_count: skippedCount,
      review_priority: reviewPriority,
    },
  });

  revalidatePath("/admin/data");
  revalidatePath("/admin/quality");

  return {
    status: "success",
    message: `初期データ候補を審査DBへ${stagedCount}件登録しました。重複スキップ: ${skippedCount}件。`,
    stagedCount,
    skippedCount,
    errors: [],
  };
}

export async function importInitialDataAction(
  _prevState: InitialDataImportState,
  formData: FormData,
): Promise<InitialDataImportState> {
  const adminUser = await requireAdminUser();
  const content = formData.get("csv");
  const csv = typeof content === "string" ? content : "";

  if (!csv.trim()) {
    return {
      status: "error",
      message: "CSVを入力してください。",
      importedCount: 0,
      skippedCount: 0,
      errors: ["CSVが空です。"],
    };
  }

  const validation = validateInitialDataCsv(csv);
  const structuralErrors = validation.issues
    .filter((issue) => issue.severity === "error")
    .map((issue) => `${issue.row}行目 ${issue.column}: ${issue.message}`);

  const { rows } = parseCsv(csv);

  if (rows.length === 0) {
    structuralErrors.push("投入対象のデータ行がありません。");
  }

  if (structuralErrors.length > 0) {
    return {
      status: "error",
      message: "CSVのエラーを修正してから投入してください。",
      importedCount: 0,
      skippedCount: 0,
      errors: structuralErrors.slice(0, 20),
    };
  }

  const supabase = createSupabaseAdminClient();
  const [areasResult, riskTagsResult] = await Promise.all([
    supabase
      .from("areas")
      .select("id,slug,name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("risk_tags")
      .select("id,slug,label")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (areasResult.error || riskTagsResult.error) {
    return {
      status: "error",
      message: "管理用マスタを取得できませんでした。",
      importedCount: 0,
      skippedCount: 0,
      errors: ["areas または risk_tags の取得に失敗しました。"],
    };
  }

  const areas = (areasResult.data ?? []) as AreaRow[];
  const riskTags = (riskTagsResult.data ?? []) as RiskTagRow[];
  const riskTagMap = new Map<string, RiskTagRow>();

  for (const tag of riskTags) {
    riskTagMap.set(tag.slug, tag);
    riskTagMap.set(tag.label, tag);
  }

  const rowErrors = rows.flatMap((row, index) => {
    const riskTagLabels = splitRiskTags(getText(row, "risk_tags"));

    return buildRowErrors({
      row,
      lineNumber: index + 2,
      area: findArea(row, areas),
      riskTagLabels,
      riskTagMap,
    });
  });

  if (rowErrors.length > 0) {
    return {
      status: "error",
      message: "安全投入の条件を満たさない行があります。",
      importedCount: 0,
      skippedCount: 0,
      errors: rowErrors.slice(0, 30),
    };
  }

  let importedCount = 0;
  let skippedCount = 0;

  try {
    for (const row of rows) {
      const area = findArea(row, areas);
      if (!area) {
        continue;
      }

      const shopName = getText(row, "place_name") || getText(row, "address") || "名称未確認";
      const publicSummary = getText(row, "public_summary");

      const isDuplicate = await hasDuplicateSeedReport({
        areaId: area.id,
        shopName,
        publicSummary,
      });

      if (isDuplicate) {
        skippedCount += 1;
        continue;
      }

      const placeId = await findOrCreatePlace({
        areaId: area.id,
        shopName,
        address: getText(row, "address") || null,
        buildingName: getText(row, "building_name") || null,
        floor: getText(row, "floor") || null,
      });

      const { data: report, error: reportError } = await supabase
        .from("reports")
        .insert({
          place_id: placeId,
          area_id: area.id,
          status: getText(row, "status"),
          evidence_level: IMPORT_EVIDENCE_LEVEL,
          shop_name: shopName,
          address: getText(row, "address") || null,
          building_name: getText(row, "building_name") || null,
          floor: getText(row, "floor") || null,
          reporter_email: INTERNAL_SEED_EMAIL,
          public_summary: publicSummary,
          private_note: buildPrivateNote(row, adminUser.email),
          source_type: getText(row, "source_type") || "other",
          source_url: getText(row, "source_url") || null,
          source_title: getText(row, "source_title") || null,
          source_checked_at: getText(row, "source_checked_at") || null,
        })
        .select("id")
        .single();

      if (reportError || !report) {
        throw reportError ?? new Error("Report insert failed.");
      }

      const selectedTags = splitRiskTags(getText(row, "risk_tags"))
        .map((label) => riskTagMap.get(label))
        .filter((tag): tag is RiskTagRow => Boolean(tag));

      if (selectedTags.length > 0) {
        const { error: tagError } = await supabase.from("report_risk_tags").insert(
          selectedTags.map((tag) => ({
            report_id: report.id,
            risk_tag_id: tag.id,
          })),
        );

        if (tagError) {
          throw tagError;
        }
      }

      await supabase.from("admin_actions").insert({
        admin_user_id: adminUser.id,
        action: "initial_data_imported",
        target_table: "reports",
        target_id: report.id,
        summary: "初期データCSVから非公開デフォルトの投稿を作成しました。",
        metadata: {
          source_type: getText(row, "source_type"),
          source_url: getText(row, "source_url") || null,
          risk_tag_count: selectedTags.length,
          forced_evidence_level: IMPORT_EVIDENCE_LEVEL,
        },
      });

      importedCount += 1;
    }
  } catch {
    return {
      status: "error",
      message:
        "投入中にエラーが発生しました。管理画面の投稿一覧で作成済み行を確認してください。",
      importedCount,
      skippedCount,
      errors: ["一部の行だけ保存されている可能性があります。重複行は次回投入時にスキップされます。"],
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/data");
  revalidatePath("/admin/reports");

  return {
    status: "success",
    message: `初期データを${importedCount}件投入しました。重複スキップ: ${skippedCount}件。`,
    importedCount,
    skippedCount,
    errors: [],
  };
}

export async function importInitialDataCandidatesAction() {
  const candidateCsv = getInitialDataCandidateCsv();
  if (!candidateCsv) {
    redirect(
      "/admin/data?candidate_import=missing_source&candidate_imported=0&candidate_skipped=0",
    );
  }

  const formData = new FormData();
  formData.set("csv", candidateCsv);

  const result = await importInitialDataAction(
    {
      status: "idle",
      message: "",
      importedCount: 0,
      skippedCount: 0,
      errors: [],
    },
    formData,
  );
  const params = new URLSearchParams({
    candidate_import: result.status,
    candidate_imported: String(result.importedCount),
    candidate_skipped: String(result.skippedCount),
  });

  redirect(`/admin/data?${params.toString()}`);
}

export async function stageOfficialAreaSeedCandidatesAction() {
  const formData = new FormData();
  formData.set("csv", getOfficialAreaSeedCandidateCsv());
  formData.set("review_priority", "high");

  const result = await stageInitialDataCandidatesAction(
    {
      status: "idle",
      message: "",
      stagedCount: 0,
      skippedCount: 0,
      errors: [],
    },
    formData,
  );
  const params = new URLSearchParams({
    official_seed: result.status,
    official_staged: String(result.stagedCount),
    official_skipped: String(result.skippedCount),
  });

  redirect(`/admin/data?${params.toString()}`);
}

export async function stageMediaEvidenceCandidatesAction() {
  const formData = new FormData();
  formData.set("csv", getMediaEvidenceCandidateCsv());
  formData.set("review_priority", "high");

  const result = await stageInitialDataCandidatesAction(
    {
      status: "idle",
      message: "",
      stagedCount: 0,
      skippedCount: 0,
      errors: [],
    },
    formData,
  );
  const params = new URLSearchParams({
    media_seed: result.status,
    media_staged: String(result.stagedCount),
    media_skipped: String(result.skippedCount),
  });

  redirect(`/admin/data?${params.toString()}`);
}

export async function updateInitialDataReviewCandidateAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const candidateId = getFormText(formData, "candidate_id");
  const reviewPriority = getFormText(formData, "review_priority");
  const legalReviewStatus = getFormText(formData, "legal_review_status");
  const publishDecision = getFormText(formData, "publish_decision");
  const reviewNote = getFormText(formData, "review_note") || null;
  const sourceVerified = getFormCheckbox(formData, "source_verified");
  const publicSummaryChecked = getFormCheckbox(formData, "public_summary_checked");
  const buildingChecked = getFormCheckbox(formData, "building_checked");

  if (
    !candidateId ||
    !isInitialDataReviewPriority(reviewPriority) ||
    !isInitialDataLegalReviewStatus(legalReviewStatus) ||
    !isInitialDataPublishDecision(publishDecision)
  ) {
    redirect("/admin/data?candidate_review_error=invalid");
  }

  if (
    publishDecision === "import_private" &&
    (!sourceVerified ||
      !publicSummaryChecked ||
      !buildingChecked ||
      legalReviewStatus !== "approved_for_import")
  ) {
    redirect("/admin/data?candidate_review_error=not_ready");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("initial_data_review_candidates")
    .update({
      review_priority: reviewPriority,
      source_verified: sourceVerified,
      public_summary_checked: publicSummaryChecked,
      building_checked: buildingChecked,
      legal_review_status: legalReviewStatus,
      publish_decision: publishDecision,
      review_note: reviewNote,
      reviewed_by_admin: adminUser.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", candidateId);

  if (error) {
    redirect("/admin/data?candidate_review_error=update_failed");
  }

  await writeDataAdminAction({
    adminUserId: adminUser.id,
    action: "initial_data_candidate_reviewed",
    targetTable: "initial_data_review_candidates",
    targetId: candidateId,
    summary: `初期データ候補を更新しました。判断: ${publishDecision}`,
    metadata: {
      review_priority: reviewPriority,
      source_verified: sourceVerified,
      public_summary_checked: publicSummaryChecked,
      building_checked: buildingChecked,
      legal_review_status: legalReviewStatus,
      publish_decision: publishDecision,
    },
  });

  revalidatePath("/admin/data");
  revalidatePath("/admin/quality");
  redirect("/admin/data?candidate_review_saved=1");
}

export async function importInitialDataReviewCandidateAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const candidateId = getFormText(formData, "candidate_id");

  if (!candidateId) {
    redirect("/admin/data?candidate_import_error=invalid");
  }

  const supabase = createSupabaseAdminClient();
  const { data: candidateData, error: candidateError } = await supabase
    .from("initial_data_review_candidates")
    .select(
      "id,source_type,source_url,source_title,source_checked_at,observed_area,place_name,address,building_name,floor,incident_type,risk_tags,evidence_level,public_summary,private_memo,proposed_status,source_verified,public_summary_checked,building_checked,legal_review_status,publish_decision,linked_report_id",
    )
    .eq("id", candidateId)
    .maybeSingle();

  if (candidateError || !candidateData) {
    redirect("/admin/data?candidate_import_error=not_found");
  }

  const candidate = candidateData as InitialDataReviewCandidateImportRow;
  const importErrors = getCandidateImportErrors(candidate);

  if (importErrors.length > 0) {
    await writeDataAdminAction({
      adminUserId: adminUser.id,
      action: "initial_data_candidate_import_blocked",
      targetTable: "initial_data_review_candidates",
      targetId: candidate.id,
      summary: "初期データ候補の非公開投入を条件未達で停止しました。",
      metadata: {
        errors: importErrors,
      },
    });

    redirect("/admin/data?candidate_import_error=not_ready");
  }

  const [areasResult, riskTagsResult] = await Promise.all([
    supabase
      .from("areas")
      .select("id,slug,name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("risk_tags")
      .select("id,slug,label")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (areasResult.error || riskTagsResult.error) {
    redirect("/admin/data?candidate_import_error=master_failed");
  }

  const areas = (areasResult.data ?? []) as AreaRow[];
  const area = areas.find(
    (item) => item.slug === candidate.observed_area || item.name === candidate.observed_area,
  );

  if (!area) {
    redirect("/admin/data?candidate_import_error=area_not_found");
  }

  const riskTags = (riskTagsResult.data ?? []) as RiskTagRow[];
  const riskTagMap = new Map<string, RiskTagRow>();

  for (const tag of riskTags) {
    riskTagMap.set(tag.slug, tag);
    riskTagMap.set(tag.label, tag);
  }

  const shopName = candidate.place_name ?? candidate.address ?? "名称未確認";
  const duplicateReportId = await findDuplicateSeedReportId({
    areaId: area.id,
    shopName,
    publicSummary: candidate.public_summary,
  });

  if (duplicateReportId) {
    await supabase
      .from("initial_data_review_candidates")
      .update({
        linked_report_id: duplicateReportId,
        reviewed_by_admin: adminUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", candidate.id);

    await writeDataAdminAction({
      adminUserId: adminUser.id,
      action: "initial_data_candidate_import_deduped",
      targetTable: "initial_data_review_candidates",
      targetId: candidate.id,
      summary: "既存の非公開投稿へ初期データ候補を紐付けました。",
      metadata: {
        linked_report_id: duplicateReportId,
      },
    });

    revalidatePath("/admin/data");
    revalidatePath("/admin/reports");
    redirect("/admin/data?candidate_imported=deduped");
  }

  let placeId: string;

  try {
    placeId = await findOrCreatePlace({
      areaId: area.id,
      shopName,
      address: candidate.address,
      buildingName: candidate.building_name,
      floor: candidate.floor,
    });
  } catch {
    redirect("/admin/data?candidate_import_error=place_failed");
  }

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      place_id: placeId,
      area_id: area.id,
      status: candidate.proposed_status,
      evidence_level: IMPORT_EVIDENCE_LEVEL,
      shop_name: shopName,
      address: candidate.address,
      building_name: candidate.building_name,
      floor: candidate.floor,
      reporter_email: INTERNAL_SEED_EMAIL,
      public_summary: candidate.public_summary,
      private_note: buildPrivateNoteFromCandidate(candidate, adminUser.email),
      source_type: candidate.source_type,
      source_url: candidate.source_url,
      source_title: candidate.source_title,
      source_checked_at: candidate.source_checked_at,
    })
    .select("id")
    .single();

  if (reportError || !report) {
    redirect("/admin/data?candidate_import_error=report_failed");
  }

  const selectedTags = (candidate.risk_tags ?? [])
    .map((label) => riskTagMap.get(label))
    .filter((tag): tag is RiskTagRow => Boolean(tag));

  if (selectedTags.length > 0) {
    const { error: tagError } = await supabase.from("report_risk_tags").insert(
      selectedTags.map((tag) => ({
        report_id: report.id,
        risk_tag_id: tag.id,
      })),
    );

    if (tagError) {
      await writeDataAdminAction({
        adminUserId: adminUser.id,
        action: "initial_data_candidate_tag_link_failed",
        targetTable: "reports",
        targetId: report.id as string,
        summary: "非公開投稿作成後、リスクタグの紐付けに失敗しました。",
        metadata: {
          candidate_id: candidate.id,
          risk_tag_count: selectedTags.length,
        },
      });
    }
  }

  const reportId = report.id as string;

  const { error: updateError } = await supabase
    .from("initial_data_review_candidates")
    .update({
      linked_report_id: reportId,
      reviewed_by_admin: adminUser.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", candidate.id);

  if (updateError) {
    redirect("/admin/data?candidate_import_error=link_failed");
  }

  await writeDataAdminAction({
    adminUserId: adminUser.id,
    action: "initial_data_candidate_imported_private_report",
    targetTable: "reports",
    targetId: reportId,
    summary: "初期データ候補から非公開デフォルトの投稿を作成しました。",
    metadata: {
      candidate_id: candidate.id,
      source_type: candidate.source_type,
      source_url: candidate.source_url,
      risk_tag_count: selectedTags.length,
      forced_evidence_level: IMPORT_EVIDENCE_LEVEL,
      non_public_status: candidate.proposed_status,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/data");
  revalidatePath("/admin/quality");
  revalidatePath("/admin/reports");

  redirect(`/admin/data?candidate_imported=1&report_id=${reportId}`);
}
