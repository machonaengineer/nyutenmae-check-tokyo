export const REPORT_SOURCE_TYPES = [
  "user_report",
  "public_agency",
  "police",
  "consumer_center",
  "municipality",
  "news",
  "internal_tip",
  "external_review_trend",
  "other",
] as const;

export type ReportSourceType = (typeof REPORT_SOURCE_TYPES)[number];

export const REPORT_SOURCE_TYPE_LABELS: Record<ReportSourceType, string> = {
  user_report: "投稿者申告",
  public_agency: "公的機関",
  police: "警察",
  consumer_center: "消費生活相談",
  municipality: "自治体",
  news: "報道",
  internal_tip: "自社確認メモ",
  external_review_trend: "外部傾向",
  other: "その他",
};

export function isReportSourceType(value: string): value is ReportSourceType {
  return REPORT_SOURCE_TYPES.includes(value as ReportSourceType);
}

export function getReportSourceTypeLabel(value: string | null | undefined) {
  if (!value || !isReportSourceType(value)) {
    return "確認中";
  }

  return REPORT_SOURCE_TYPE_LABELS[value];
}

export function isSourceBackedReport(value: string | null | undefined) {
  return Boolean(value && value !== "user_report");
}
