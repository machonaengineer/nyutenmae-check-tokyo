import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const files = {
  scorecard: "PRODUCT_KGI_KPI_SCORECARD.csv",
  snsQueue: "SNS_AUTO_POST_QUEUE.csv",
  sourceQueue: "SOURCE_RESEARCH_QUEUE.csv",
  initialReview: "INITIAL_DATA_REVIEW_QUEUE.csv",
  areaQueue: "AREA_DATA_COLLECTION_QUEUE.csv",
};

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

async function readCsv(fileName) {
  const filePath = path.join(rootDir, fileName);
  const text = await readFile(filePath, "utf8");
  const [header, ...records] = parseCsv(text);
  return records.map((record) =>
    Object.fromEntries(header.map((key, index) => [key, record[index] ?? ""])),
  );
}

function countBy(rows, key) {
  return rows.reduce((counts, row) => {
    const value = row[key] || "blank";
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function formatCounts(counts) {
  return Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`)
    .join(", ");
}

function toDate(value) {
  if (!value) return null;
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00+09:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysBetween(left, right) {
  return Math.round((left.getTime() - right.getTime()) / 86_400_000);
}

function recentRows(rows, dateKey, today, maxDays) {
  return rows.filter((row) => {
    const date = toDate(row[dateKey]);
    return date && daysBetween(today, date) >= 0 && daysBetween(today, date) < maxDays;
  });
}

function listTopActions({ sourceRows, reviewRows, snsRows }) {
  const actions = [];
  const highUnstartedSources = sourceRows.filter(
    (row) => row.priority === "high" && row.research_status !== "done",
  );
  const unverifiedCandidates = reviewRows.filter(
    (row) => row.review_priority === "high" && row.source_verified !== "yes",
  );
  const blockedSns = snsRows.filter((row) => row.status === "blocked");

  if (blockedSns.length > 0) {
    actions.push("SNS投稿のblocked原因を解消し、公式API投稿または本人確認済みブラウザ運用を安定化する");
  }
  if (highUnstartedSources.length > 0) {
    actions.push("high priorityの公式ソースを確認し、確認日と独自要約を更新する");
  }
  if (unverifiedCandidates.length > 0) {
    actions.push("high priorityの初期データ候補を出典確認済みに進め、公開可否を判断する");
  }
  actions.push("Search ConsoleとSupabase管理画面の実数をPRODUCT_KPI_LOG_TEMPLATE.csvへ週次転記する");

  return actions.slice(0, 4);
}

async function main() {
  const todayArg = getArg("date", new Date().toISOString().slice(0, 10));
  const today = toDate(todayArg);

  if (!today) {
    throw new Error(`Invalid --date value: ${todayArg}`);
  }

  const [scorecard, snsQueue, sourceQueue, initialReview, areaQueue] =
    await Promise.all([
      readCsv(files.scorecard),
      readCsv(files.snsQueue),
      readCsv(files.sourceQueue),
      readCsv(files.initialReview),
      readCsv(files.areaQueue),
    ]);

  const recentSns = recentRows(snsQueue, "date", today, 30);
  const recentPosted = recentSns.filter((row) => row.status === "posted");
  const recentBlocked = recentSns.filter((row) => row.status === "blocked");
  const highSources = sourceQueue.filter((row) => row.priority === "high");
  const highUnstartedSources = highSources.filter(
    (row) => row.research_status !== "done",
  );
  const highReview = initialReview.filter((row) => row.review_priority === "high");
  const highUnverifiedReview = highReview.filter(
    (row) => row.source_verified !== "yes",
  );

  const output = [
    `KPI summary for ${todayArg}`,
    "",
    "KGI status",
    `- tracked metrics: ${scorecard.length}`,
    `- red metrics: ${scorecard.filter((row) => row.status === "red").length}`,
    `- yellow metrics: ${scorecard.filter((row) => row.status === "yellow").length}`,
    `- green metrics: ${scorecard.filter((row) => row.status === "green").length}`,
    "",
    "SNS",
    `- last 30 days posted: ${recentPosted.length}`,
    `- last 30 days blocked: ${recentBlocked.length}`,
    `- status counts: ${formatCounts(countBy(recentSns, "status")) || "none"}`,
    "",
    "Source research",
    `- total sources: ${sourceQueue.length}`,
    `- high priority not done: ${highUnstartedSources.length}`,
    `- status counts: ${formatCounts(countBy(sourceQueue, "research_status"))}`,
    "",
    "Initial data review",
    `- review candidates: ${initialReview.length}`,
    `- high priority unverified: ${highUnverifiedReview.length}`,
    `- recommended status counts: ${formatCounts(
      countBy(initialReview, "recommended_status"),
    )}`,
    "",
    "Area operations",
    `- queued area tasks: ${areaQueue.length}`,
    `- priority counts: ${formatCounts(countBy(areaQueue, "priority"))}`,
    `- track counts: ${formatCounts(countBy(areaQueue, "track"))}`,
    "",
    "Next actions",
    ...listTopActions({
      sourceRows: sourceQueue,
      reviewRows: initialReview,
      snsRows: recentSns,
    }).map((action, index) => `${index + 1}. ${action}`),
  ];

  console.log(output.join("\n"));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
