import {
  containsDangerousExpression,
  DANGEROUS_EXPRESSION_NOTICE,
  OBJECTION_TEXT_FIELD_LABELS,
} from "@/lib/content-safety";

export const OBJECTION_REASON_OPTIONS = [
  { value: "fact_check", label: "事実関係の確認依頼" },
  { value: "personal_information", label: "個人情報に関する確認依頼" },
  { value: "rights_concern", label: "権利侵害に関する確認依頼" },
  { value: "correction_request", label: "表現修正の依頼" },
  { value: "other", label: "その他" },
] as const;

export type ObjectionFormErrors = Record<string, string[]>;

export type ObjectionFormSnapshot = {
  [key: string]: string;
};

export type ValidatedObjectionForm = {
  reportId: string | null;
  targetUrl: string | null;
  requesterName: string | null;
  requesterEmail: string;
  requesterRelationship: string | null;
  reasonCategory: string;
  details: string;
  privateNote: string | null;
};

export type ObjectionValidationResult =
  | { ok: true; data: ValidatedObjectionForm; values: ObjectionFormSnapshot }
  | { ok: false; errors: ObjectionFormErrors; values: ObjectionFormSnapshot };

function pushError(errors: ObjectionFormErrors, field: string, message: string) {
  errors[field] = [...(errors[field] ?? []), message];
}

function getText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function buildSnapshot(formData: FormData): ObjectionFormSnapshot {
  const fields = [
    "report_id",
    "target_url",
    "requester_name",
    "requester_email",
    "requester_relationship",
    "reason_category",
    "details",
    "private_note",
  ];

  return Object.fromEntries(fields.map((field) => [field, getText(formData, field)]));
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isSafeTargetUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return true;
  }

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function validateObjectionFormData(formData: FormData): ObjectionValidationResult {
  const errors: ObjectionFormErrors = {};
  const values = buildSnapshot(formData);
  const reportId = getText(formData, "report_id");
  const targetUrl = getText(formData, "target_url");
  const requesterName = getText(formData, "requester_name");
  const requesterEmail = getText(formData, "requester_email");
  const requesterRelationship = getText(formData, "requester_relationship");
  const reasonCategory = getText(formData, "reason_category");
  const details = getText(formData, "details");
  const privateNote = getText(formData, "private_note");

  if (reportId && !isUuid(reportId)) {
    pushError(errors, "report_id", "投稿IDの形式を確認してください。");
  }

  if (!targetUrl && !reportId) {
    pushError(errors, "target_url", "対象URLまたは投稿IDを入力してください。");
  }

  if (targetUrl && (targetUrl.length > 500 || !isSafeTargetUrl(targetUrl))) {
    pushError(errors, "target_url", "対象URLはhttp、https、またはサイト内パスで入力してください。");
  }

  if (requesterName && requesterName.length > 120) {
    pushError(errors, "requester_name", "申立て者名は120文字以内で入力してください。");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail)) {
    pushError(errors, "requester_email", "連絡可能なメールアドレスを入力してください。");
  }

  if (requesterRelationship.length > 120) {
    pushError(errors, "requester_relationship", "関係性は120文字以内で入力してください。");
  }

  if (!OBJECTION_REASON_OPTIONS.some((option) => option.value === reasonCategory)) {
    pushError(errors, "reason_category", "申立て種別を選択してください。");
  }

  if (details.length < 30 || details.length > 2000) {
    pushError(errors, "details", "申立て内容は30文字以上2000文字以内で入力してください。");
  }

  if (privateNote.length > 1000) {
    pushError(errors, "private_note", "補足は1000文字以内で入力してください。");
  }

  for (const field of Object.keys(OBJECTION_TEXT_FIELD_LABELS)) {
    if (containsDangerousExpression(getText(formData, field))) {
      pushError(errors, field, DANGEROUS_EXPRESSION_NOTICE);
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values };
  }

  return {
    ok: true,
    values,
    data: {
      reportId: reportId || null,
      targetUrl: targetUrl || null,
      requesterName: requesterName || null,
      requesterEmail,
      requesterRelationship: requesterRelationship || null,
      reasonCategory,
      details,
      privateNote: privateNote || null,
    },
  };
}
