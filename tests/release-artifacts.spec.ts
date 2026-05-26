import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

const rootDir = path.resolve(__dirname, "..");

const requiredReleaseFiles = [
  "INITIAL_DATA_TEMPLATE.csv",
  "SEED_DATA_GUIDE.md",
  "LAUNCH_CHECKLIST.md",
  "LAUNCH_PLAN.md",
  "OPERATIONS_SOP.md",
  "LEGAL_REVIEW_NOTES.md",
  "CAPTCHA_FUTURE_NOTES.md",
  "supabase/migrations/0003_mvp_release_hardening.sql",
  "supabase/migrations/0004_submission_hardening.sql",
  "supabase/migrations/0005_browser_rate_limit_key.sql",
  "supabase/migrations/0006_service_role_privileges.sql",
  "supabase/migrations/0007_external_rating_snapshots.sql",
  "EXTERNAL_RATING_TEMPLATE.csv",
  "EXTERNAL_RATING_GUIDE.md",
] as const;

const initialDataColumns = [
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

const externalRatingColumns = [
  "place_id",
  "source_slug",
  "external_place_id",
  "source_url",
  "source_title",
  "rating_value",
  "rating_scale",
  "rating_count",
  "checked_at",
  "collection_method",
  "display_allowed",
  "attribution_label",
  "public_note",
  "private_memo",
] as const;

test.describe("リリース準備資料", () => {
  for (const filePath of requiredReleaseFiles) {
    test(`${filePath} が存在する`, async () => {
      const content = await readFile(path.join(rootDir, filePath), "utf8");
      expect(content.trim().length).toBeGreaterThan(0);
    });
  }

  test("初期データCSVに必要な列がある", async () => {
    const content = await readFile(
      path.join(rootDir, "INITIAL_DATA_TEMPLATE.csv"),
      "utf8",
    );
    const header = content.trim().split(/\r?\n/)[0].split(",");

    expect(header).toEqual([...initialDataColumns]);
  });

  test("READMEから本番公開前チェックリストへ誘導している", async () => {
    const readme = await readFile(path.join(rootDir, "README.md"), "utf8");

    expect(readme).toContain("LAUNCH_CHECKLIST.md");
    expect(readme).toContain("0003_mvp_release_hardening.sql");
    expect(readme).toContain("0004_submission_hardening.sql");
    expect(readme).toContain("0005_browser_rate_limit_key.sql");
    expect(readme).toContain("0006_service_role_privileges.sql");
    expect(readme).toContain("0007_external_rating_snapshots.sql");
    expect(readme).toContain("EXTERNAL_RATING_GUIDE.md");
  });

  test("hardening migrationがRLSとStorage privateを強化している", async () => {
    const migration = await readFile(
      path.join(rootDir, "supabase/migrations/0003_mvp_release_hardening.sql"),
      "utf8",
    );

    expect(migration).toContain("force row level security");
    expect(migration).toContain("set public = false");
    expect(migration).toContain("revoke all on table public.reports from anon, authenticated");
    expect(migration).toContain(
      "revoke all on table public.report_evidence_files from anon, authenticated",
    );
    expect(migration).not.toContain("grant select on table public.reports to anon");
    expect(migration).not.toContain("grant select on table public.report_evidence_files to anon");
  });

  test("初期データガイドが外部情報の転載は禁止と独自要約を明記している", async () => {
    const guide = await readFile(path.join(rootDir, "SEED_DATA_GUIDE.md"), "utf8");

    expect(guide).toContain("そのまま転載せず");
    expect(guide).toContain("独自要約");
    expect(guide).toContain("リスクタグ");
    expect(guide).toContain("出典URL");
    expect(guide).toContain("確認日");
    expect(guide).toContain("Google口コミ、食べログ、SNS、ニュース本文の転載は禁止");
  });

  test("外部評価CSVに必要な列がある", async () => {
    const content = await readFile(
      path.join(rootDir, "EXTERNAL_RATING_TEMPLATE.csv"),
      "utf8",
    );
    const header = content.trim().split(/\r?\n/)[0].split(",");

    expect(header).toEqual([...externalRatingColumns]);
  });

  test("外部評価ガイドが転載は禁止と公式API/許諾方針を明記している", async () => {
    const guide = await readFile(path.join(rootDir, "EXTERNAL_RATING_GUIDE.md"), "utf8");

    for (const keyword of [
      "口コミ本文",
      "投稿者名",
      "スクレイピングHTML",
      "食べログは許諾確認まで公開表示しない",
      "Googleは公式API",
      "外部評価と本サービスの注意報告は評価軸が異なります",
    ]) {
      expect(guide).toContain(keyword);
    }
  });

  test("法務レビュー用メモが主要な法務論点を含む", async () => {
    const notes = await readFile(path.join(rootDir, "LEGAL_REVIEW_NOTES.md"), "utf8");

    for (const keyword of [
      "断定",
      "異議申立て",
      "削除申請",
      "店舗側反論",
      "証拠画像URLは一般公開しない",
    ]) {
      expect(notes).toContain(keyword);
    }
  });

  test("運用SOPが審査、証拠確認、非公開化、削除依頼、操作ログを含む", async () => {
    const sop = await readFile(path.join(rootDir, "OPERATIONS_SOP.md"), "utf8");

    for (const keyword of [
      "投稿審査フロー",
      "証拠画像",
      "異議申立て対応",
      "非公開化",
      "削除依頼",
      "admin_actions",
    ]) {
      expect(sop).toContain(keyword);
    }
  });

  test("本番公開前チェックリストが公開前の安全確認を含む", async () => {
    const checklist = await readFile(path.join(rootDir, "LAUNCH_CHECKLIST.md"), "utf8");

    for (const keyword of [
      "non_admin_visibility_checks.sql",
      "report-evidence-files",
      "private",
      "reporter_email",
      "pending",
      "Hidden",
      "ADMIN_EMAILS",
      "Service Role Key",
      "RATE_LIMIT_SECRET",
      "honeypot",
      "同一ブラウザ相当",
      "nt_submission_client_id",
    ]) {
      expect(checklist).toContain(keyword);
    }
  });

  test("submission hardening migrationがrate limit状態を非公開にしている", async () => {
    const migration = await readFile(
      path.join(rootDir, "supabase/migrations/0004_submission_hardening.sql"),
      "utf8",
    );

    expect(migration).toContain("submission_rate_limits");
    expect(migration).toContain("force row level security");
    expect(migration).toContain(
      "revoke all on table public.submission_rate_limits from anon, authenticated",
    );
    expect(migration).toContain("unique (form_kind, key_type, key_hash)");
  });

  test("browser rate limit migrationがkey_type制約を広げている", async () => {
    const migration = await readFile(
      path.join(rootDir, "supabase/migrations/0005_browser_rate_limit_key.sql"),
      "utf8",
    );

    expect(migration).toContain("submission_rate_limits_key_type_check");
    expect(migration).toContain("'browser'");
    expect(migration).not.toContain("disable row level security");
  });

  test("service role migrationがanon/authenticatedを緩めずserver権限だけを付ける", async () => {
    const migration = await readFile(
      path.join(rootDir, "supabase/migrations/0006_service_role_privileges.sql"),
      "utf8",
    );

    expect(migration).toContain("to service_role");
    expect(migration).toContain("storage.objects");
    expect(migration).not.toContain("to anon");
    expect(migration).not.toContain("to authenticated");
    expect(migration).not.toContain("disable row level security");
  });

  test("外部評価migrationが公開ビューを限定し、直接読み取りを許可しない", async () => {
    const migration = await readFile(
      path.join(rootDir, "supabase/migrations/0007_external_rating_snapshots.sql"),
      "utf8",
    );

    expect(migration).toContain("external_rating_snapshots");
    expect(migration).toContain("force row level security");
    expect(migration).toContain("public_external_rating_snapshots");
    expect(migration).toContain("ers.display_allowed = true");
    expect(migration).toContain("r.status = 'approved'");
    expect(migration).toContain(
      "revoke all on table public.external_rating_snapshots from anon, authenticated",
    );
    expect(migration).toContain(
      "revoke all on table public.place_external_refs from anon, authenticated",
    );
    expect(migration).not.toContain(
      "grant select on table public.external_rating_snapshots to anon",
    );
    expect(migration).not.toContain("disable row level security");
  });

  test("Google Places APIキーはサーバー専用環境変数として扱う", async () => {
    const envExample = await readFile(path.join(rootDir, ".env.example"), "utf8");
    const googlePlaces = await readFile(
      path.join(rootDir, "src/lib/google-places.ts"),
      "utf8",
    );

    expect(envExample).toContain("GOOGLE_PLACES_API_KEY=");
    expect(envExample).not.toContain("NEXT_PUBLIC_GOOGLE_PLACES_API_KEY");
    expect(googlePlaces).toContain("process.env.GOOGLE_PLACES_API_KEY");
    expect(googlePlaces).toContain("server-only");
  });

  test("submission protectionがHTTP-only Cookieでブラウザ相当の連投制限を行う", async () => {
    const source = await readFile(
      path.join(rootDir, "src/lib/submission-protection.ts"),
      "utf8",
    );

    expect(source).toContain('type RateLimitKeyType = "ip" | "email" | "browser"');
    expect(source).toContain('const BROWSER_RATE_LIMIT_COOKIE = "nt_submission_client_id"');
    expect(source).toContain("httpOnly: true");
    expect(source).toContain('keyType: "browser"');
  });

  test("captcha将来導入メモがサーバー側検証とsecret分離を明記している", async () => {
    const notes = await readFile(path.join(rootDir, "CAPTCHA_FUTURE_NOTES.md"), "utf8");

    expect(notes).toContain("Cloudflare Turnstile");
    expect(notes).toContain("hCaptcha");
    expect(notes).toContain("サーバー側");
    expect(notes).toContain("Service Role Keyとは別のsecret");
  });
});
