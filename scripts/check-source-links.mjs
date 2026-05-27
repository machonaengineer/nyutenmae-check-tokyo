import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const queuePath = path.join(rootDir, "SOURCE_RESEARCH_QUEUE.csv");

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const maxArg = process.argv.find((arg) => arg.startsWith("--max="));
const maxChecks = maxArg ? Number.parseInt(maxArg.replace("--max=", ""), 10) : undefined;

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
  const headers = parseCsvLine(headerLine);

  return lines
    .filter(Boolean)
    .map((line) => {
      const cells = parseCsvLine(line);
      return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    });
}

async function fetchWithTimeout(url, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "nyutenmae-check-tokyo-link-check/1.0",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithRetry(url, method) {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await fetchWithTimeout(url, method);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    }
  }

  throw lastError;
}

async function checkUrl(url) {
  try {
    let response;

    try {
      response = await fetchWithRetry(url, "HEAD");
    } catch {
      response = await fetchWithRetry(url, "GET");
    }

    if (response.status === 405 || response.status === 403) {
      response = await fetchWithRetry(url, "GET");
    }

    return {
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      url,
    };
  } catch (error) {
    return {
      ok: false,
      status: "network_error",
      url,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const rows = parseCsv(await readFile(queuePath, "utf8"));
const urls = [...new Set(rows.map((row) => row.source_url).filter(Boolean))];
const targets =
  typeof maxChecks === "number" && Number.isFinite(maxChecks)
    ? urls.slice(0, Math.max(0, maxChecks))
    : urls;

console.log(`source_links_total=${urls.length}`);

if (dryRun) {
  console.log(`dry_run=true checked=0 queued=${targets.length}`);
  process.exit(0);
}

let failed = 0;

for (const url of targets) {
  const result = await checkUrl(url);
  const status = result.ok ? "ok" : "review";
  console.log(`${status} status=${result.status} url=${url}`);

  if (!result.ok) {
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`source_links_failed=${failed}`);
  process.exit(1);
}

console.log(`source_links_checked=${targets.length}`);
