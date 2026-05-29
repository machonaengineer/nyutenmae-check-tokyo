import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const DEFAULT_QUEUE_FILE = "SNS_AUTO_POST_QUEUE.csv";
const DEFAULT_API_BASE_URL = "https://api.x.com";
const DEFAULT_SITE_URL = "https://nyutenmae-check-tokyo.vercel.app";
const MAX_POST_LENGTH = 280;

const requiredColumns = [
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

      if (key === "--queue" && value) {
        return { ...acc, queueFile: value };
      }

      return acc;
    },
    {
      dryRun: false,
      date: null,
      slot: null,
      queueFile: null,
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

function parseQueue(content) {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error("SNS auto-post queue is empty.");
  }

  const columns = parseCsvLine(lines[0]);
  const missingColumns = requiredColumns.filter((column) => !columns.includes(column));

  if (missingColumns.length > 0) {
    throw new Error(`SNS auto-post queue is missing columns: ${missingColumns.join(", ")}`);
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

function serializeQueue(columns, rows) {
  return [
    columns.join(","),
    ...rows.map(({ row }) =>
      columns.map((column) => escapeCsvCell(row[column] ?? "")).join(","),
    ),
    "",
  ].join("\n");
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

function buildPostText(row) {
  const baseText = row.text.trim();
  const targetPath = row.target_path.trim();

  if (!targetPath) {
    return baseText;
  }

  const targetUrl = targetPath.startsWith("http")
    ? targetPath
    : `${getSiteUrl()}${targetPath.startsWith("/") ? targetPath : `/${targetPath}`}`;

  return `${baseText}\n${targetUrl}`;
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

function pickApprovedQueueItem(rows, date, slot) {
  return rows.find(({ row }) => {
    const matchesDate = row.date === date;
    const matchesSlot = slot ? row.slot === slot : true;
    const isApproved = row.status === "approved";
    const isNotPosted = !row.posted_at && !row.post_url;

    return matchesDate && matchesSlot && isApproved && isNotPosted;
  });
}

async function postToX(text) {
  const token = process.env.X_USER_ACCESS_TOKEN;

  if (!token) {
    throw new Error("X_USER_ACCESS_TOKEN is required when SNS_AUTO_POST_ENABLED=true.");
  }

  const apiBaseUrl = process.env.X_API_BASE_URL || DEFAULT_API_BASE_URL;
  const response = await fetch(`${apiBaseUrl}/2/tweets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`X API post failed: ${response.status} ${JSON.stringify(body)}`);
  }

  return body;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const queueFile = args.queueFile || process.env.SNS_AUTO_POST_QUEUE_FILE || DEFAULT_QUEUE_FILE;
  const queuePath = path.isAbsolute(queueFile)
    ? queueFile
    : path.join(rootDir, queueFile);
  const date = args.date || getTokyoDateString();
  const isEnabled = process.env.SNS_AUTO_POST_ENABLED === "true";
  const isDryRun = args.dryRun || !isEnabled;

  const content = await readFile(queuePath, "utf8");
  const { columns, rows } = parseQueue(content);
  const selectedItem = pickApprovedQueueItem(rows, date, args.slot);

  if (!selectedItem) {
    console.log(`No approved SNS post queued for ${date}${args.slot ? ` ${args.slot}` : ""}.`);
    return;
  }

  const text = buildPostText(selectedItem.row);
  const errors = validatePostText(text);

  if (errors.length > 0) {
    throw new Error(`SNS post blocked: ${errors.join("; ")}`);
  }

  if (isDryRun) {
    console.log("DRY RUN: prepared SNS post");
    console.log(text);
    return;
  }

  const result = await postToX(text);
  const postId = result?.data?.id;
  const profileUsername = process.env.X_POST_PROFILE_USERNAME || "nyutenmaecheck";
  const now = new Date().toISOString();

  selectedItem.row.status = "posted";
  selectedItem.row.posted_at = now;
  selectedItem.row.post_url = postId
    ? `https://x.com/${profileUsername}/status/${postId}`
    : "";

  await writeFile(queuePath, serializeQueue(columns, rows), "utf8");
  console.log(`SNS post published at ${now}${postId ? `: ${selectedItem.row.post_url}` : ""}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
