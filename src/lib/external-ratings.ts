export const EXTERNAL_COLLECTION_METHODS = [
  "manual",
  "official_api",
  "admin_note",
] as const;

export type ExternalCollectionMethod = (typeof EXTERNAL_COLLECTION_METHODS)[number];

export function isExternalCollectionMethod(
  value: string,
): value is ExternalCollectionMethod {
  return EXTERNAL_COLLECTION_METHODS.includes(value as ExternalCollectionMethod);
}

export function getExternalCollectionMethodLabel(method: string) {
  const labels: Record<string, string> = {
    manual: "管理者確認",
    official_api: "公式API",
    admin_note: "管理メモ",
  };

  return labels[method] ?? method;
}

export function formatExternalRating(
  ratingValue: number | null,
  ratingScale: number | null,
) {
  if (ratingValue === null || ratingScale === null) {
    return "未記録";
  }

  return `${ratingValue.toFixed(2)} / ${ratingScale.toFixed(1)}`;
}

export function formatRatingCount(value: number | null) {
  if (value === null) {
    return "件数未記録";
  }

  return `${new Intl.NumberFormat("ja-JP").format(value)}件`;
}

export function parseNullableNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseNullableInteger(value: string) {
  if (!value) {
    return null;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  return Number(value);
}
