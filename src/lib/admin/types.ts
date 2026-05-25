export const REPORT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "needs_review",
  "hidden",
] as const;

export const EVIDENCE_LEVEL_VALUES = ["S", "A", "B", "C", "D", "Hidden"] as const;

export const OBJECTION_STATUSES = ["pending", "reviewing", "resolved", "rejected"] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];
export type EvidenceLevelValue = (typeof EVIDENCE_LEVEL_VALUES)[number];
export type ObjectionStatus = (typeof OBJECTION_STATUSES)[number];

export function isReportStatus(value: string): value is ReportStatus {
  return REPORT_STATUSES.includes(value as ReportStatus);
}

export function isEvidenceLevel(value: string): value is EvidenceLevelValue {
  return EVIDENCE_LEVEL_VALUES.includes(value as EvidenceLevelValue);
}

export function isObjectionStatus(value: string): value is ObjectionStatus {
  return OBJECTION_STATUSES.includes(value as ObjectionStatus);
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "審査待ち",
    approved: "承認済み",
    rejected: "却下",
    needs_review: "差し戻し",
    hidden: "非公開",
  };

  return labels[status] ?? status;
}

export function getObjectionStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "未確認",
    reviewing: "確認中",
    resolved: "対応済み",
    rejected: "対応なし",
  };

  return labels[status] ?? status;
}
