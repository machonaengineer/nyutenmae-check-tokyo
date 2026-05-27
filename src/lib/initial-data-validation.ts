import { containsDangerousExpression } from "@/lib/content-safety";
import { isReportSourceType } from "@/lib/report-sources";

export const INITIAL_DATA_COLUMNS = [
  "source_type",
  "source_url",
  "source_title",
  "source_checked_at",
  "observed_area",
  "place_name",
  "address",
  "building_name",
  "floor",
  "incident_type",
  "risk_tags",
  "evidence_level",
  "public_summary",
  "private_memo",
  "status",
  "reviewed_by_admin",
  "published_at",
] as const;

const allowedStatuses = new Set([
  "pending",
  "approved",
  "rejected",
  "needs_review",
  "hidden",
]);

const allowedEvidenceLevels = new Set(["S", "A", "B", "C", "D", "Hidden"]);

const externalCopyRiskTerms = [
  "Google口コミより",
  "食べログより",
  "SNSより",
  "原文",
  "全文",
  "引用:",
  "引用：",
  "レビュー本文",
] as const;

const nonPublicTextMarkerCodes = [
  [114, 101, 112, 111, 114, 116, 101, 114, 95, 101, 109, 97, 105, 108],
  [115, 116, 111, 114, 97, 103, 101, 95, 112, 97, 116, 104],
  [
    114, 101, 112, 111, 114, 116, 45, 101, 118, 105, 100, 101, 110, 99, 101,
    45, 102, 105, 108, 101, 115,
  ],
] as const;

function getNonPublicTextMarkers() {
  return nonPublicTextMarkerCodes.map((codes) => String.fromCharCode(...codes));
}

export function containsExternalCopyRiskText(text: string) {
  return externalCopyRiskTerms.some((term) => text.includes(term));
}

export function containsNonPublicTextMarker(text: string) {
  const normalizedText = text.toLowerCase();
  return getNonPublicTextMarkers().some((marker) => normalizedText.includes(marker));
}

export type CsvValidationIssue = {
  row: number;
  column: string;
  severity: "error" | "warning";
  message: string;
};

export type CsvValidationResult = {
  rowCount: number;
  statusCounts: Record<string, number>;
  evidenceCounts: Record<string, number>;
  issues: CsvValidationIssue[];
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && inQuotes && next === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

export function parseCsv(content: string) {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { header: [] as string[], rows: [] as Record<string, string>[] };
  }

  const header = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(header.map((column, index) => [column, values[index] ?? ""]));
  });

  return { header, rows };
}

function addIssue(
  issues: CsvValidationIssue[],
  row: number,
  column: string,
  severity: CsvValidationIssue["severity"],
  message: string,
) {
  issues.push({ row, column, severity, message });
}

export function validateInitialDataCsv(content: string): CsvValidationResult {
  const { header, rows } = parseCsv(content);
  const issues: CsvValidationIssue[] = [];
  const statusCounts: Record<string, number> = {};
  const evidenceCounts: Record<string, number> = {};

  if (header.length === 0) {
    addIssue(issues, 1, "header", "error", "CSVヘッダーがありません。");
  }

  for (const column of INITIAL_DATA_COLUMNS) {
    if (!header.includes(column)) {
      addIssue(issues, 1, column, "error", "必須列がありません。");
    }
  }

  header.forEach((column, index) => {
    if (column !== INITIAL_DATA_COLUMNS[index]) {
      addIssue(
        issues,
        1,
        column || `column_${index + 1}`,
        "warning",
        "列順がテンプレートと異なります。投入前に確認してください。",
      );
    }
  });

  rows.forEach((row, rowIndex) => {
    const lineNumber = rowIndex + 2;
    const status = row.status || "";
    const evidenceLevel = row.evidence_level || "";

    statusCounts[status || "empty"] = (statusCounts[status || "empty"] ?? 0) + 1;
    evidenceCounts[evidenceLevel || "empty"] =
      (evidenceCounts[evidenceLevel || "empty"] ?? 0) + 1;

    if (!status || !allowedStatuses.has(status)) {
      addIssue(issues, lineNumber, "status", "error", "statusが許可値ではありません。");
    }

    if (!evidenceLevel || !allowedEvidenceLevels.has(evidenceLevel)) {
      addIssue(
        issues,
        lineNumber,
        "evidence_level",
        "error",
        "evidence_levelが許可値ではありません。",
      );
    }

    if (status === "approved") {
      addIssue(
        issues,
        lineNumber,
        "status",
        "warning",
        "初期投入でapprovedにする場合は、人間の公開審査記録が必要です。",
      );
    }

    if (evidenceLevel !== "Hidden" && status !== "approved") {
      addIssue(
        issues,
        lineNumber,
        "evidence_level",
        "warning",
        "非公開状態では、証拠レベルHiddenを維持する運用が安全です。",
      );
    }

    for (const requiredColumn of ["source_checked_at", "observed_area", "incident_type"]) {
      if (!row[requiredColumn]) {
        addIssue(issues, lineNumber, requiredColumn, "warning", "確認用の値が空です。");
      }
    }

    if (row.source_type && !isReportSourceType(row.source_type)) {
      addIssue(issues, lineNumber, "source_type", "error", "source_typeが許可値ではありません。");
    }

    if (row.source_url && !/^https?:\/\/.+/i.test(row.source_url)) {
      addIssue(issues, lineNumber, "source_url", "error", "source_urlはhttp(s) URLにしてください。");
    }

    if (row.source_checked_at && !/^\d{4}-\d{2}-\d{2}$/.test(row.source_checked_at)) {
      addIssue(
        issues,
        lineNumber,
        "source_checked_at",
        "error",
        "source_checked_atはYYYY-MM-DDで入力してください。",
      );
    }

    const publicText = row.public_summary || "";
    const sourceTitle = row.source_title || "";
    const privateMemo = row.private_memo || "";

    if (!publicText || publicText.length < 20) {
      addIssue(
        issues,
        lineNumber,
        "public_summary",
        "warning",
        "公開サマリーが短いため、独自要約として十分か確認してください。",
      );
    }

    if (containsDangerousExpression(publicText)) {
      addIssue(
        issues,
        lineNumber,
        "public_summary",
        "error",
        "公開サマリーに危険表現が含まれています。",
      );
    }

    if (containsDangerousExpression(sourceTitle)) {
      addIssue(
        issues,
        lineNumber,
        "source_title",
        "error",
        "公開される出典タイトルに危険表現が含まれています。",
      );
    }

    for (const term of externalCopyRiskTerms) {
      if (publicText.includes(term) || privateMemo.includes(term)) {
        addIssue(
          issues,
          lineNumber,
          "public_summary",
          "warning",
          "外部口コミやニュース本文の転載に見える表現があります。",
        );
      }
    }

    if (containsNonPublicTextMarker(publicText)) {
      addIssue(
        issues,
        lineNumber,
        "public_summary",
        "error",
        "公開サマリーに非公開情報を示す文字列が含まれています。",
      );
    }

    if (containsNonPublicTextMarker(sourceTitle)) {
      addIssue(
        issues,
        lineNumber,
        "source_title",
        "error",
        "公開される出典タイトルに非公開情報を示す文字列が含まれています。",
      );
    }
  });

  return {
    rowCount: rows.length,
    statusCounts,
    evidenceCounts,
    issues,
  };
}
