export function formatDate(value: string | null) {
  if (!value) {
    return "確認中";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function formatCurrency(value: number | null) {
  if (value === null) {
    return "記載なし";
  }

  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBoolean(value: boolean | null) {
  if (value === null) {
    return "確認中";
  }

  return value ? "はい" : "いいえ";
}
