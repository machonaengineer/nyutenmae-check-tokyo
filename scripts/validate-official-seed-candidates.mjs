import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const csvPath = path.join(rootDir, "OFFICIAL_SOURCE_SEED_CANDIDATES.csv");

const requiredColumns = [
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
];

const prohibitedTerms = [
  "ぼったくり店",
  "悪質店",
  "詐欺店",
  "犯罪店",
  "反社",
  "絶対行くな",
  "サクラ確定",
  "クズ",
  "晒し",
];

const sensitiveMarkers = [
  "reporter_email",
  "private_note",
  "storage_path",
  "report-evidence-files",
  "SUPABASE_SERVICE_ROLE_KEY",
];

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function parseCsv(csv) {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const header = parseCsvLine(headerLine);
  const rows = lines.filter(Boolean).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(header.map((column, index) => [column, cells[index] ?? ""]));
  });

  return { header, rows };
}

const csv = await readFile(csvPath, "utf8");
const { header, rows } = parseCsv(csv);
const errors = [];
const allText = csv;

if (header.join(",") !== requiredColumns.join(",")) {
  errors.push("header does not match INITIAL_DATA_TEMPLATE.csv columns");
}

if (rows.length !== 12) {
  errors.push(`expected 12 rows, got ${rows.length}`);
}

for (const [index, row] of rows.entries()) {
  const rowNumber = index + 2;

  if (row.status !== "needs_review") {
    errors.push(`${rowNumber}: status must be needs_review`);
  }

  if (row.evidence_level !== "Hidden") {
    errors.push(`${rowNumber}: evidence_level must be Hidden`);
  }

  if (!/^https:\/\/.+/i.test(row.source_url)) {
    errors.push(`${rowNumber}: source_url must be https`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.source_checked_at)) {
    errors.push(`${rowNumber}: source_checked_at must be YYYY-MM-DD`);
  }

  if (!row.place_name.startsWith("エリア注意情報")) {
    errors.push(`${rowNumber}: place_name must be area-level seed`);
  }

  if (row.address || row.building_name || row.floor) {
    errors.push(`${rowNumber}: official area seed must not include address/building/floor`);
  }

  if (row.public_summary.length < 40) {
    errors.push(`${rowNumber}: public_summary is too short`);
  }

  if (!row.private_memo.includes("非公開審査候補")) {
    errors.push(`${rowNumber}: private_memo must explain private review candidate handling`);
  }
}

for (const term of [...prohibitedTerms, ...sensitiveMarkers]) {
  if (allText.includes(term)) {
    errors.push(`forbidden marker found: ${term}`);
  }
}

if (allText.includes("Google口コミ") || allText.includes("食べログ") || allText.includes("レビュー本文")) {
  errors.push("external review copy marker found");
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`official_seed_candidates_ok rows=${rows.length}`);
