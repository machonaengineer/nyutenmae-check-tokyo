import {
  containsDangerousExpression,
  DANGEROUS_EXPRESSION_NOTICE,
  REPORT_TEXT_FIELD_LABELS,
} from "@/lib/content-safety";
import {
  ALLOWED_EVIDENCE_EXTENSIONS,
  ALLOWED_EVIDENCE_MIME_TYPES,
  isAllowedEvidenceMimeType,
  isMimeExtensionPairAllowed,
} from "@/lib/evidence-file-policy";

export const EVIDENCE_BUCKET = "report-evidence-files";
export const MAX_EVIDENCE_FILES = 5;
export const DEFAULT_MAX_UPLOAD_MB = 5;

export const FEE_EXPLANATION_OPTIONS = [
  { value: "", label: "未選択" },
  { value: "explained_before_entry", label: "入店前に説明があった" },
  { value: "explained_inside_store", label: "店内で説明があった" },
  { value: "unclear", label: "説明が不明確だった" },
  { value: "not_explained", label: "説明がなかった" },
  { value: "other", label: "その他" },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "未選択" },
  { value: "cash", label: "現金" },
  { value: "credit_card", label: "クレジットカード" },
  { value: "debit_card", label: "デビットカード" },
  { value: "qr", label: "QR決済" },
  { value: "mixed", label: "複数手段" },
  { value: "other", label: "その他" },
] as const;

export type ReportFormErrors = Record<string, string[]>;

export type ReportFormSnapshot = {
  [key: string]: string | string[];
};

export type ValidatedReportForm = {
  areaSlug: string;
  riskTagSlugs: string[];
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
  files: File[];
};

export type ValidationResult =
  | { ok: true; data: ValidatedReportForm; values: ReportFormSnapshot }
  | { ok: false; errors: ReportFormErrors; values: ReportFormSnapshot };

const BOOLEAN_FIELDS = [
  "was_solicited",
  "price_explained_before_entry",
  "receipt_available",
  "itemized_bill_available",
  "felt_intimidated",
  "had_companions",
  "consulted_police",
  "consulted_consumer_center",
  "consulted_card_company",
] as const;

function pushError(errors: ReportFormErrors, field: string, message: string) {
  errors[field] = [...(errors[field] ?? []), message];
}

function getText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getNullableText(formData: FormData, field: string) {
  const value = getText(formData, field);
  return value.length > 0 ? value : null;
}

function getNullableBoolean(formData: FormData, field: string) {
  const value = getText(formData, field);

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

function getNullableInteger(
  formData: FormData,
  field: string,
  errors: ReportFormErrors,
  label: string,
  options: { min: number; max: number },
) {
  const value = getText(formData, field);

  if (!value) {
    return null;
  }

  if (!/^\d+$/.test(value)) {
    pushError(errors, field, `${label}は半角数字で入力してください。`);
    return null;
  }

  const parsed = Number(value);
  if (parsed < options.min || parsed > options.max) {
    pushError(
      errors,
      field,
      `${label}は${options.min}から${options.max}の範囲で入力してください。`,
    );
    return null;
  }

  return parsed;
}

function getFiles(formData: FormData) {
  return formData
    .getAll("evidence_files")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function getStringList(formData: FormData, field: string) {
  return formData
    .getAll(field)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildSnapshot(formData: FormData): ReportFormSnapshot {
  const snapshot: ReportFormSnapshot = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      continue;
    }

    const currentValue = snapshot[key];
    if (typeof currentValue === "string") {
      snapshot[key] = [currentValue, value];
      continue;
    }

    if (Array.isArray(currentValue)) {
      snapshot[key] = [...currentValue, value];
      continue;
    }

    snapshot[key] = value;
  }

  for (const field of BOOLEAN_FIELDS) {
    snapshot[field] ??= "";
  }

  return snapshot;
}

function getAllowedMimeLabel() {
  return "JPG、PNG、WebP、HEIC、HEIF";
}

export function getEvidenceAcceptAttribute() {
  return [
    ...ALLOWED_EVIDENCE_MIME_TYPES,
    ...ALLOWED_EVIDENCE_EXTENSIONS.map((extension) => `.${extension}`),
  ].join(",");
}

export function getMaxUploadMb() {
  const rawValue = process.env.MAX_UPLOAD_MB;
  const parsed = rawValue ? Number(rawValue) : DEFAULT_MAX_UPLOAD_MB;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MAX_UPLOAD_MB;
  }

  return Math.min(parsed, DEFAULT_MAX_UPLOAD_MB);
}

export function validateReportFormData(
  formData: FormData,
  options: { maxUploadMb?: number } = {},
): ValidationResult {
  const errors: ReportFormErrors = {};
  const values = buildSnapshot(formData);
  const maxUploadMb = options.maxUploadMb ?? DEFAULT_MAX_UPLOAD_MB;
  const maxUploadBytes = maxUploadMb * 1024 * 1024;

  const areaSlug = getText(formData, "area_slug");
  const riskTagSlugs = getStringList(formData, "risk_tags");
  const shopName = getText(formData, "shop_name");
  const reporterEmail = getText(formData, "reporter_email");
  const publicSummary = getText(formData, "public_summary");
  const googleMapsUrl = getNullableText(formData, "google_maps_url");
  const visitedAt = getNullableText(formData, "visited_at");
  const files = getFiles(formData);

  if (!areaSlug) {
    pushError(errors, "area_slug", "対象エリアを選択してください。");
  }

  if (shopName.length < 2 || shopName.length > 120) {
    pushError(errors, "shop_name", "店舗名または場所の手がかりは2文字以上120文字以内で入力してください。");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail)) {
    pushError(errors, "reporter_email", "連絡可能なメールアドレスを入力してください。");
  }

  if (publicSummary.length < 30 || publicSummary.length > 2000) {
    pushError(errors, "public_summary", "報告内容は30文字以上2000文字以内で入力してください。");
  }

  for (const field of Object.keys(REPORT_TEXT_FIELD_LABELS)) {
    if (containsDangerousExpression(getText(formData, field))) {
      pushError(errors, field, DANGEROUS_EXPRESSION_NOTICE);
    }
  }

  if (googleMapsUrl) {
    try {
      const url = new URL(googleMapsUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        pushError(errors, "google_maps_url", "Google Maps URLはhttpまたはhttpsで入力してください。");
      }
    } catch {
      pushError(errors, "google_maps_url", "Google Maps URLの形式を確認してください。");
    }
  }

  if (visitedAt && Number.isNaN(Date.parse(visitedAt))) {
    pushError(errors, "visited_at", "来店日時の形式を確認してください。");
  }

  const partySize = getNullableInteger(formData, "party_size", errors, "人数", {
    min: 1,
    max: 100,
  });
  const actualBilledAmount = getNullableInteger(
    formData,
    "actual_billed_amount",
    errors,
    "会計金額",
    { min: 0, max: 10_000_000 },
  );

  if (files.length > MAX_EVIDENCE_FILES) {
    pushError(errors, "evidence_files", `証拠画像は最大${MAX_EVIDENCE_FILES}件までです。`);
  }

  for (const file of files) {
    if (file.size > maxUploadBytes) {
      pushError(errors, "evidence_files", `${file.name}は${maxUploadMb}MB以内にしてください。`);
    }

    if (!isAllowedEvidenceMimeType(file.type)) {
      pushError(
        errors,
        "evidence_files",
        `${file.name}は${getAllowedMimeLabel()}形式の画像にしてください。`,
      );
      continue;
    }

    if (!isMimeExtensionPairAllowed(file.name, file.type)) {
      pushError(
        errors,
        "evidence_files",
        `${file.name}の拡張子とファイル形式を確認してください。`,
      );
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values };
  }

  return {
    ok: true,
    values,
    data: {
      areaSlug,
      riskTagSlugs,
      shopName,
      address: getNullableText(formData, "address"),
      googleMapsUrl,
      buildingName: getNullableText(formData, "building_name"),
      floor: getNullableText(formData, "floor"),
      visitedAt: visitedAt ? new Date(visitedAt).toISOString() : null,
      partySize,
      wasSolicited: getNullableBoolean(formData, "was_solicited"),
      solicitationDescription: getNullableText(formData, "solicitation_description"),
      priceExplainedBeforeEntry: getNullableBoolean(formData, "price_explained_before_entry"),
      explanationInsideStore: getNullableText(formData, "explanation_inside_store"),
      actualBilledAmount,
      orderedItems: getNullableText(formData, "ordered_items"),
      feeExplanationStatus: getNullableText(formData, "fee_explanation_status"),
      receiptAvailable: getNullableBoolean(formData, "receipt_available"),
      itemizedBillAvailable: getNullableBoolean(formData, "itemized_bill_available"),
      paymentMethod: getNullableText(formData, "payment_method"),
      checkoutResponse: getNullableText(formData, "checkout_response"),
      exitResponse: getNullableText(formData, "exit_response"),
      feltIntimidated: getNullableBoolean(formData, "felt_intimidated"),
      hadCompanions: getNullableBoolean(formData, "had_companions"),
      consultedPolice: getNullableBoolean(formData, "consulted_police"),
      consultedConsumerCenter: getNullableBoolean(formData, "consulted_consumer_center"),
      consultedCardCompany: getNullableBoolean(formData, "consulted_card_company"),
      reporterEmail,
      publicSummary,
      privateNote: getNullableText(formData, "private_note"),
      files,
    },
  };
}
