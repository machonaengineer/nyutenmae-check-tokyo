import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const DEFAULT_QUEUE_FILE = "SNS_REPLY_QUEUE.csv";
const DEFAULT_API_BASE_URL = "https://api.x.com";
const DEFAULT_SITE_URL = "https://nyutenmae-check-tokyo.vercel.app";
const MAX_REPLY_LENGTH = 280;

const requiredColumns = [
  "discovered_at",
  "source_url",
  "tweet_id",
  "author_handle",
  "summoned_account",
  "status",
  "reply_text",
  "target_path",
  "approved_by",
  "posted_at",
  "reply_url",
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

      if (key === "--tweet-id" && value) {
        return { ...acc, tweetId: value };
      }

      if (key === "--queue" && value) {
        return { ...acc, queueFile: value };
      }

      return acc;
    },
    {
      dryRun: false,
      tweetId: null,
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
    throw new Error("SNS reply queue is empty.");
  }

  const columns = parseCsvLine(lines[0]);
  const missingColumns = requiredColumns.filter((column) => !columns.includes(column));

  if (missingColumns.length > 0) {
    throw new Error(`SNS reply queue is missing columns: ${missingColumns.join(", ")}`);
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

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
}

function isTruthy(value) {
  return ["true", "yes", "1", "y"].includes(value.trim().toLowerCase());
}

function buildReplyText(row) {
  const baseText = row.reply_text.trim();
  const targetPath = row.target_path.trim();

  if (!targetPath) {
    return baseText;
  }

  const targetUrl = targetPath.startsWith("http")
    ? targetPath
    : `${getSiteUrl()}${targetPath.startsWith("/") ? targetPath : `/${targetPath}`}`;

  return `${baseText}\n${targetUrl}`;
}

function validateReplyItem(row, text) {
  const errors = [];

  if (!row.tweet_id.trim()) {
    errors.push("tweet_id is required");
  }

  if (!isTruthy(row.summoned_account)) {
    errors.push("source post must mention or quote this account before API reply");
  }

  if (text.length === 0) {
    errors.push("reply text is empty");
  }

  if (text.length > MAX_REPLY_LENGTH) {
    errors.push(`reply text exceeds ${MAX_REPLY_LENGTH} characters`);
  }

  for (const term of prohibitedTerms) {
    if (text.includes(term)) {
      errors.push(`reply text contains prohibited term: ${term}`);
    }
  }

  for (const marker of sensitiveMarkers) {
    if (text.includes(marker)) {
      errors.push(`reply text contains sensitive marker: ${marker}`);
    }
  }

  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) {
    errors.push("reply text appears to contain an email address");
  }

  return errors;
}

function pickApprovedReplyItem(rows, tweetId) {
  return rows.find(({ row }) => {
    const matchesTweet = tweetId ? row.tweet_id === tweetId : true;
    const isApproved = row.status === "approved";
    const isNotPosted = !row.posted_at && !row.reply_url;

    return matchesTweet && isApproved && isNotPosted;
  });
}

async function replyToX(tweetId, text) {
  const token = process.env.X_USER_ACCESS_TOKEN;

  if (!token) {
    throw new Error("X_USER_ACCESS_TOKEN is required when SNS_AUTO_REPLY_ENABLED=true.");
  }

  const apiBaseUrl = process.env.X_API_BASE_URL || DEFAULT_API_BASE_URL;
  const response = await fetch(`${apiBaseUrl}/2/tweets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      reply: {
        in_reply_to_tweet_id: tweetId,
      },
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`X API reply failed: ${response.status} ${JSON.stringify(body)}`);
  }

  return body;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const queueFile = args.queueFile || process.env.SNS_REPLY_QUEUE_FILE || DEFAULT_QUEUE_FILE;
  const queuePath = path.isAbsolute(queueFile)
    ? queueFile
    : path.join(rootDir, queueFile);
  const isEnabled = process.env.SNS_AUTO_REPLY_ENABLED === "true";
  const isDryRun = args.dryRun || !isEnabled;

  const content = await readFile(queuePath, "utf8");
  const { columns, rows } = parseQueue(content);
  const selectedItem = pickApprovedReplyItem(rows, args.tweetId);

  if (!selectedItem) {
    console.log(`No approved SNS reply queued${args.tweetId ? ` for ${args.tweetId}` : ""}.`);
    return;
  }

  const text = buildReplyText(selectedItem.row);
  const errors = validateReplyItem(selectedItem.row, text);

  if (errors.length > 0) {
    throw new Error(`SNS reply blocked: ${errors.join("; ")}`);
  }

  if (isDryRun) {
    console.log("DRY RUN: prepared SNS reply");
    console.log(`reply_to=${selectedItem.row.tweet_id}`);
    console.log(text);
    return;
  }

  const result = await replyToX(selectedItem.row.tweet_id, text);
  const replyId = result?.data?.id;
  const profileUsername = process.env.X_POST_PROFILE_USERNAME || "nyutenmaecheck";
  const now = new Date().toISOString();

  selectedItem.row.status = "posted";
  selectedItem.row.posted_at = now;
  selectedItem.row.reply_url = replyId
    ? `https://x.com/${profileUsername}/status/${replyId}`
    : "";

  await writeFile(queuePath, serializeQueue(columns, rows), "utf8");
  console.log(`SNS reply published at ${now}${replyId ? `: ${selectedItem.row.reply_url}` : ""}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
