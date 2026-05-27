export const REPORT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "needs_review",
  "hidden",
] as const;

export const EVIDENCE_LEVEL_VALUES = ["S", "A", "B", "C", "D", "Hidden"] as const;

export const OBJECTION_STATUSES = ["pending", "reviewing", "resolved", "rejected"] as const;
export const INITIAL_DATA_REVIEW_PRIORITIES = ["low", "medium", "high"] as const;
export const INITIAL_DATA_LEGAL_REVIEW_STATUSES = [
  "not_started",
  "in_review",
  "approved_for_import",
  "rejected",
] as const;
export const INITIAL_DATA_PUBLISH_DECISIONS = [
  "undecided",
  "needs_more_sources",
  "import_private",
  "reject",
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];
export type EvidenceLevelValue = (typeof EVIDENCE_LEVEL_VALUES)[number];
export type ObjectionStatus = (typeof OBJECTION_STATUSES)[number];
export type InitialDataReviewPriority =
  (typeof INITIAL_DATA_REVIEW_PRIORITIES)[number];
export type InitialDataLegalReviewStatus =
  (typeof INITIAL_DATA_LEGAL_REVIEW_STATUSES)[number];
export type InitialDataPublishDecision =
  (typeof INITIAL_DATA_PUBLISH_DECISIONS)[number];

export function isReportStatus(value: string): value is ReportStatus {
  return REPORT_STATUSES.includes(value as ReportStatus);
}

export function isEvidenceLevel(value: string): value is EvidenceLevelValue {
  return EVIDENCE_LEVEL_VALUES.includes(value as EvidenceLevelValue);
}

export function isObjectionStatus(value: string): value is ObjectionStatus {
  return OBJECTION_STATUSES.includes(value as ObjectionStatus);
}

export function isInitialDataReviewPriority(
  value: string,
): value is InitialDataReviewPriority {
  return INITIAL_DATA_REVIEW_PRIORITIES.includes(
    value as InitialDataReviewPriority,
  );
}

export function isInitialDataLegalReviewStatus(
  value: string,
): value is InitialDataLegalReviewStatus {
  return INITIAL_DATA_LEGAL_REVIEW_STATUSES.includes(
    value as InitialDataLegalReviewStatus,
  );
}

export function isInitialDataPublishDecision(
  value: string,
): value is InitialDataPublishDecision {
  return INITIAL_DATA_PUBLISH_DECISIONS.includes(
    value as InitialDataPublishDecision,
  );
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

export function getInitialDataPriorityLabel(priority: string) {
  const labels: Record<string, string> = {
    low: "低",
    medium: "中",
    high: "高",
  };

  return labels[priority] ?? priority;
}

export function getInitialDataLegalReviewStatusLabel(status: string) {
  const labels: Record<string, string> = {
    not_started: "未着手",
    in_review: "確認中",
    approved_for_import: "非公開投入可",
    rejected: "不採用",
  };

  return labels[status] ?? status;
}

export function getInitialDataPublishDecisionLabel(decision: string) {
  const labels: Record<string, string> = {
    undecided: "未判断",
    needs_more_sources: "追加出典待ち",
    import_private: "非公開投入へ",
    reject: "不採用",
  };

  return labels[decision] ?? decision;
}
