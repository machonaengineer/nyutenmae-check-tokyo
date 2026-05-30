import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const DEFAULT_CALENDAR_FILE = "SOCIAL_CONTENT_CALENDAR.csv";
const DEFAULT_QUEUE_FILE = "SNS_AUTO_POST_QUEUE.csv";
const DEFAULT_SITE_URL = "https://nyutenmae-check-tokyo.vercel.app";
const DEFAULT_START_DATE = "2026-05-29";
const MAX_POST_LENGTH = 280;

const queueColumns = [
  "date",
  "slot",
  "status",
  "text",
  "target_path",
  "approved_by",
  "posted_at",
  "post_url",
  "notes",
];

const calendarColumns = [
  "day",
  "slot",
  "platform",
  "post_type",
  "theme",
  "post_text",
  "target_url",
  "cta",
  "safety_check",
  "status",
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
  "X_USER_ACCESS_TOKEN",
];

function parseArgs(argv) {
  return argv.reduce(
    (acc, arg) => {
      if (arg === "--dry-run") {
        return { ...acc, dryRun: true };
      }

      const [key, value] = arg.split("=");

      if (key === "--date" && value) {
        return { ...acc, date: value };
      }

      if (key === "--slot" && value) {
        return { ...acc, slot: value };
      }

      if (key === "--calendar-day" && value) {
        return { ...acc, calendarDay: Number(value) };
      }

      if (key === "--calendar" && value) {
        return { ...acc, calendarFile: value };
      }

      if (key === "--queue" && value) {
        return { ...acc, queueFile: value };
      }

      return acc;
    },
    {
      calendarDay: null,
      calendarFile: null,
      date: null,
      dryRun: false,
      queueFile: null,
      slot: "morning",
    },
  );
}

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

function escapeCsvCell(value) {
  const cell = value ?? "";

  if (/[",\r\n]/.test(cell)) {
    return `"${cell.replaceAll("\"", "\"\"")}"`;
  }

  return cell;
}

function parseCsv(content, requiredColumns, label) {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error(`${label} is empty.`);
  }

  const columns = parseCsvLine(lines[0]);
  const missingColumns = requiredColumns.filter((column) => !columns.includes(column));

  if (missingColumns.length > 0) {
    throw new Error(`${label} is missing columns: ${missingColumns.join(", ")}`);
  }

  const rows = lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    const row = Object.fromEntries(
      columns.map((column, cellIndex) => [column, cells[cellIndex] ?? ""]),
    );

    return {
      index: index + 1,
      row,
    };
  });

  return { columns, rows };
}

function serializeCsv(columns, rows) {
  return [
    columns.join(","),
    ...rows.map(({ row }) =>
      columns.map((column) => escapeCsvCell(row[column] ?? "")).join(","),
    ),
    "",
  ].join("\n");
}

function resolveWorkspacePath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(rootDir, filePath);
}

function getTokyoDateString(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
}

function daysBetween(startDate, targetDate) {
  const start = Date.parse(`${startDate}T00:00:00+09:00`);
  const target = Date.parse(`${targetDate}T00:00:00+09:00`);

  if (Number.isNaN(start) || Number.isNaN(target)) {
    throw new Error("Invalid date. Use YYYY-MM-DD.");
  }

  return Math.max(0, Math.floor((target - start) / 86_400_000));
}

function buildPostText(text, targetPath) {
  if (!targetPath) {
    return text.trim();
  }

  const targetUrl = targetPath.startsWith("http")
    ? targetPath
    : `${getSiteUrl()}${targetPath.startsWith("/") ? targetPath : `/${targetPath}`}`;

  return `${text.trim()}\n${targetUrl}`;
}

function validatePostText(text) {
  const errors = [];

  if (text.length === 0) {
    errors.push("post text is empty");
  }

  if (text.length > MAX_POST_LENGTH) {
    errors.push(`post text exceeds ${MAX_POST_LENGTH} characters`);
  }

  for (const term of prohibitedTerms) {
    if (text.includes(term)) {
      errors.push(`post text contains prohibited term: ${term}`);
    }
  }

  for (const marker of sensitiveMarkers) {
    if (text.includes(marker)) {
      errors.push(`post text contains sensitive marker: ${marker}`);
    }
  }

  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) {
    errors.push("post text appears to contain an email address");
  }

  return errors;
}

function pickCalendarRow(rows, date, slot, explicitCalendarDay) {
  const candidates = rows
    .map(({ row }) => row)
    .filter((row) => row.platform === "X" && row.status === "ready" && row.slot === slot)
    .sort((a, b) => Number(a.day) - Number(b.day));

  if (candidates.length === 0) {
    throw new Error(`No ready X calendar row found for slot: ${slot}`);
  }

  if (explicitCalendarDay) {
    const matched = candidates.find((row) => Number(row.day) === explicitCalendarDay);

    if (!matched) {
      throw new Error(`No ready X calendar row found for day: ${explicitCalendarDay}`);
    }

    return matched;
  }

  const startDate = process.env.SOCIAL_AUTOMATION_START_DATE || DEFAULT_START_DATE;
  const index = daysBetween(startDate, date) % candidates.length;
  return candidates[index];
}

function hasQueueItemForDateAndSlot(rows, date, slot) {
  return rows.some(({ row }) => row.date === date && row.slot === slot);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const date = args.date || getTokyoDateString();
  const slot = args.slot || "morning";
  const calendarPath = resolveWorkspacePath(
    args.calendarFile || process.env.SOCIAL_CONTENT_CALENDAR_FILE || DEFAULT_CALENDAR_FILE,
  );
  const queuePath = resolveWorkspacePath(
    args.queueFile || process.env.SNS_AUTO_POST_QUEUE_FILE || DEFAULT_QUEUE_FILE,
  );

  const calendar = parseCsv(
    await readFile(calendarPath, "utf8"),
    calendarColumns,
    "SNS content calendar",
  );
  const queue = parseCsv(
    await readFile(queuePath, "utf8"),
    queueColumns,
    "SNS auto-post queue",
  );

  if (hasQueueItemForDateAndSlot(queue.rows, date, slot)) {
    console.log(`SNS queue already has an item for ${date} ${slot}.`);
    return;
  }

  const selected = pickCalendarRow(calendar.rows, date, slot, args.calendarDay);
  const text = selected.post_text.trim();
  const targetPath = selected.target_url.trim();
  const errors = validatePostText(buildPostText(text, targetPath));

  if (errors.length > 0) {
    throw new Error(`SNS daily queue blocked: ${errors.join("; ")}`);
  }

  const row = {
    date,
    slot,
    status: "approved",
    text,
    target_path: targetPath,
    approved_by: "daily-safe-calendar",
    posted_at: "",
    post_url: "",
    notes: `auto-prepared from social calendar day ${selected.day}`,
  };

  if (args.dryRun) {
    console.log("DRY RUN: prepared SNS queue item");
    console.log(buildPostText(row.text, row.target_path));
    return;
  }

  queue.rows.push({ index: queue.rows.length + 1, row });
  await writeFile(queuePath, serializeCsv(queue.columns, queue.rows), "utf8");
  console.log(`SNS queue item prepared for ${date} ${slot}: calendar day ${selected.day}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
