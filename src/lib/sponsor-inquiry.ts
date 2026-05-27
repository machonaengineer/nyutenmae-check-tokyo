import {
  containsDangerousExpression,
  DANGEROUS_EXPRESSION_NOTICE,
} from "@/lib/content-safety";

export const SPONSOR_INQUIRY_ACTION = "sponsor_inquiry_submitted";

export const SPONSOR_INQUIRY_FIELD_LABELS = {
  organization_name: "組織名",
  contact_name: "担当者名",
  contact_email: "連絡用メールアドレス",
  website_url: "WebサイトURL",
  sponsor_type: "相談種別",
  budget_range: "想定予算",
  message: "相談内容",
} as const;

export const SPONSOR_TYPE_OPTIONS = [
  { value: "sponsor", label: "スポンサー相談" },
  { value: "advertising", label: "広告掲載相談" },
  { value: "partnership", label: "連携・協賛相談" },
  { value: "support", label: "支援相談" },
] as const;

export const SPONSOR_BUDGET_OPTIONS = [
  { value: "undecided", label: "未定" },
  { value: "under_10000", label: "月1万円未満" },
  { value: "10000_30000", label: "月1万〜3万円" },
  { value: "30000_100000", label: "月3万〜10万円" },
  { value: "over_100000", label: "月10万円以上" },
] as const;

export type SponsorInquiryErrors = Record<string, string[]>;
export type SponsorInquirySnapshot = Record<string, string>;

export type ValidatedSponsorInquiry = {
  organizationName: string;
  contactName: string | null;
  contactEmail: string;
  websiteUrl: string | null;
  sponsorType: string;
  budgetRange: string;
  message: string;
};

export type SponsorInquiryValidationResult =
  | { ok: true; data: ValidatedSponsorInquiry; values: SponsorInquirySnapshot }
  | { ok: false; errors: SponsorInquiryErrors; values: SponsorInquirySnapshot };

function pushError(errors: SponsorInquiryErrors, field: string, message: string) {
  errors[field] = [...(errors[field] ?? []), message];
}

function getText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function buildSnapshot(formData: FormData): SponsorInquirySnapshot {
  return Object.fromEntries(
    Object.keys(SPONSOR_INQUIRY_FIELD_LABELS).map((field) => [
      field,
      getText(formData, field),
    ]),
  );
}

function isSafeUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function validateSponsorInquiryFormData(
  formData: FormData,
): SponsorInquiryValidationResult {
  const errors: SponsorInquiryErrors = {};
  const values = buildSnapshot(formData);
  const organizationName = getText(formData, "organization_name");
  const contactName = getText(formData, "contact_name");
  const contactEmail = getText(formData, "contact_email");
  const websiteUrl = getText(formData, "website_url");
  const sponsorType = getText(formData, "sponsor_type");
  const budgetRange = getText(formData, "budget_range");
  const message = getText(formData, "message");

  if (organizationName.length < 2 || organizationName.length > 120) {
    pushError(errors, "organization_name", "組織名は2文字以上120文字以内で入力してください。");
  }

  if (contactName.length > 120) {
    pushError(errors, "contact_name", "担当者名は120文字以内で入力してください。");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    pushError(errors, "contact_email", "連絡可能なメールアドレスを入力してください。");
  }

  if (websiteUrl && (websiteUrl.length > 500 || !isSafeUrl(websiteUrl))) {
    pushError(errors, "website_url", "WebサイトURLはhttpまたはhttpsで入力してください。");
  }

  if (!SPONSOR_TYPE_OPTIONS.some((option) => option.value === sponsorType)) {
    pushError(errors, "sponsor_type", "相談種別を選択してください。");
  }

  if (!SPONSOR_BUDGET_OPTIONS.some((option) => option.value === budgetRange)) {
    pushError(errors, "budget_range", "想定予算を選択してください。");
  }

  if (message.length < 30 || message.length > 2000) {
    pushError(errors, "message", "相談内容は30文字以上2000文字以内で入力してください。");
  }

  for (const [field, label] of Object.entries(SPONSOR_INQUIRY_FIELD_LABELS)) {
    if (containsDangerousExpression(getText(formData, field))) {
      pushError(errors, field, `${label}: ${DANGEROUS_EXPRESSION_NOTICE}`);
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values };
  }

  return {
    ok: true,
    values,
    data: {
      organizationName,
      contactName: contactName || null,
      contactEmail,
      websiteUrl: websiteUrl || null,
      sponsorType,
      budgetRange,
      message,
    },
  };
}
