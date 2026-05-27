"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin/auth";
import { containsDangerousExpression } from "@/lib/content-safety";
import {
  containsExternalCopyRiskText,
  containsNonPublicTextMarker,
  parseCsv,
  validateInitialDataCsv,
} from "@/lib/initial-data-validation";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type InitialDataImportState = {
  status: "idle" | "success" | "error";
  message: string;
  importedCount: number;
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

const INTERNAL_SEED_EMAIL = "seed-data@nyutenmae-check.local";
const IMPORTABLE_STATUSES = new Set(["pending", "needs_review"]);
const IMPORT_EVIDENCE_LEVEL = "Hidden";

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

  if (!area) {
    errors.push(`${lineNumber}行目: observed_area が初期対象エリアと一致しません。`);
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

  if (!getText(row, "source_type")) {
    errors.push(`${lineNumber}行目: source_type が必要です。`);
  }

  if (!getText(row, "source_checked_at")) {
    errors.push(`${lineNumber}行目: source_checked_at が必要です。`);
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

  if (containsNonPublicTextMarker(publicSummary)) {
    errors.push(`${lineNumber}行目: public_summary に非公開情報を示す文字列があります。`);
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
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("reports")
    .select("id")
    .eq("area_id", options.areaId)
    .eq("shop_name", options.shopName)
    .eq("public_summary", options.publicSummary)
    .limit(1)
    .maybeSingle();

  return Boolean(data?.id);
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
