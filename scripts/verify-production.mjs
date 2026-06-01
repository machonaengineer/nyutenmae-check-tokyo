#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://nyutenmae-check-tokyo.vercel.app";

const baseUrl = (
  process.argv[2] ??
  process.env.PRODUCTION_VERIFY_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  DEFAULT_BASE_URL
).replace(/\/+$/, "");

const publicPageChecks = [
  { path: "/", includes: ["入店前チェック東京", "地図で確認する"] },
  { path: "/map", includes: ["注意報告マップ", "表示条件", "条件に一致する公開場所"] },
  { path: "/areas", includes: ["掲載対象エリア"] },
  { path: "/checklists", includes: ["入店前チェックリスト"] },
  { path: "/guides", includes: ["実用ガイド"] },
  { path: "/faq", includes: ["よくある質問"] },
  { path: "/support", includes: ["トラブル時の相談先", "#9110", "188"] },
  { path: "/objection", includes: ["異議申立て"] },
  { path: "/trust", includes: ["透明性と安全運用"] },
];

const textChecks = [
  {
    path: "/sitemap.xml",
    includes: ["/map", "/faq", "/checklists", "/support"],
    excludes: ["/admin"],
  },
  {
    path: "/robots.txt",
    includes: ["Disallow: /admin", "Disallow: /api", "Sitemap:"],
  },
  {
    path: "/llms.txt",
    includes: ["入店前チェック東京", "承認済み投稿だけを公開します"],
    excludes: ["reporter_email", "private_note", "storage_path"],
  },
];

const publicLeakMarkers = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "createSupabaseAdminClient",
  "reporter_email",
  "private_note",
  "storage_path",
  "report-evidence-files",
  "X_USER_ACCESS_TOKEN",
];

const prohibitedUiTerms = [
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

async function fetchText(path) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30_000),
    headers: {
      "user-agent": "nyutenmae-production-verifier/1.0",
    },
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }

  return { url, body, headers: response.headers };
}

function assertIncludes(path, body, expectedTexts) {
  for (const expected of expectedTexts ?? []) {
    if (!body.includes(expected)) {
      throw new Error(`${path} does not include expected text: ${expected}`);
    }
  }
}

function assertExcludes(path, body, excludedTexts) {
  for (const excluded of excludedTexts ?? []) {
    if (body.includes(excluded)) {
      throw new Error(`${path} includes excluded text: ${excluded}`);
    }
  }
}

async function run() {
  const failures = [];
  const checked = [];

  for (const check of [...publicPageChecks, ...textChecks]) {
    try {
      const { body, headers } = await fetchText(check.path);
      assertIncludes(check.path, body, check.includes);
      assertExcludes(check.path, body, check.excludes);
      assertExcludes(check.path, body, publicLeakMarkers);

      if (publicPageChecks.includes(check)) {
        assertExcludes(check.path, body, prohibitedUiTerms);
      }

      checked.push({
        path: check.path,
        contentType: headers.get("content-type") ?? "",
      });
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  const summary = {
    baseUrl,
    checkedCount: checked.length,
    failedCount: failures.length,
    checked,
    failures,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

await run();
