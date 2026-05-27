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
  "supabase/migrations/0008_report_source_attribution.sql",
  "EXTERNAL_RATING_TEMPLATE.csv",
  "EXTERNAL_RATING_GUIDE.md",
  "FREE_TIER_GROWTH_PLAN.md",
  "ADSENSE_SETUP_GUIDE.md",
  "SOCIAL_GROWTH_PLAN.md",
  "SNS_OPERATIONS_SOP.md",
  "SOCIAL_CONTENT_CALENDAR.csv",
  "SOURCE_RESEARCH_QUEUE.csv",
  "DATA_COLLECTION_PLAYBOOK.md",
  "src/components/json-ld.tsx",
  "src/lib/structured-data.ts",
  "src/app/llms.txt/route.ts",
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
    expect(readme).toContain("0008_report_source_attribution.sql");
    expect(readme).toContain("EXTERNAL_RATING_GUIDE.md");
    expect(readme).toContain("FREE_TIER_GROWTH_PLAN.md");
    expect(readme).toContain("ADSENSE_SETUP_GUIDE.md");
    expect(readme).toContain("SOCIAL_GROWTH_PLAN.md");
    expect(readme).toContain("SOURCE_RESEARCH_QUEUE.csv");
    expect(readme).toContain("DATA_COLLECTION_PLAYBOOK.md");
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

  test("出典メタ情報migrationは承認済み投稿だけを公開ビューへ出す", async () => {
    const migration = await readFile(
      path.join(rootDir, "supabase/migrations/0008_report_source_attribution.sql"),
      "utf8",
    );

    expect(migration).toContain("source_type");
    expect(migration).toContain("source_url");
    expect(migration).toContain("source_checked_at");
    expect(migration).toContain("public_place_reports");
    expect(migration).toContain("where r.status = 'approved'");
    expect(migration).toContain("grant select on table public.public_place_reports to anon");
    expect(migration).not.toContain("grant select on table public.reports to anon");
    expect(migration).not.toContain("grant select on table public.report_evidence_files to anon");
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

  test("無料枠重視の計測と収益化枠はデフォルトOFFで管理する", async () => {
    const envExample = await readFile(path.join(rootDir, ".env.example"), "utf8");
    const growthPlan = await readFile(
      path.join(rootDir, "FREE_TIER_GROWTH_PLAN.md"),
      "utf8",
    );
    const analyticsGate = await readFile(
      path.join(rootDir, "src/components/analytics-gate.tsx"),
      "utf8",
    );
    const monetizationSlot = await readFile(
      path.join(rootDir, "src/components/growth/monetization-slot.tsx"),
      "utf8",
    );

    expect(envExample).toContain("NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED=false");
    expect(envExample).toContain("NEXT_PUBLIC_MONETIZATION_ENABLED=false");
    expect(envExample).toContain("NEXT_PUBLIC_ADSENSE_ENABLED=false");
    expect(growthPlan).toContain("無料枠");
    expect(growthPlan).toContain("収益化を実際に開始する前");
    expect(analyticsGate).toContain('NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED !== "true"');
    expect(monetizationSlot).toContain('NEXT_PUBLIC_MONETIZATION_ENABLED !== "true"');
    expect(monetizationSlot).toContain("審査判断に影響しません");
  });

  test("SNS連携は自動投稿ではなく安全な共有導線として実装する", async () => {
    const guide = await readFile(path.join(rootDir, "SOCIAL_GROWTH_PLAN.md"), "utf8");
    const socialLib = await readFile(path.join(rootDir, "src/lib/social.ts"), "utf8");
    const socialPage = await readFile(path.join(rootDir, "src/app/social/page.tsx"), "utf8");
    const adminSocial = await readFile(
      path.join(rootDir, "src/app/admin/social/page.tsx"),
      "utf8",
    );
    const envExample = await readFile(path.join(rootDir, ".env.example"), "utf8");

    expect(guide).toContain("自動投稿API連携はMVPでは行わず");
    expect(guide).toContain("SOCIAL_CONTENT_CALENDAR.csv");
    expect(guide).toContain("SNS_OPERATIONS_SOP.md");
    expect(guide).toContain("証拠画像、投稿者メールアドレス、非公開メモをSNSに載せない");
    expect(socialLib).toContain("NEXT_PUBLIC_X_PROFILE_URL");
    expect(socialLib).toContain("buildSocialPostTemplates");
    expect(socialLib).toContain("SOCIAL_OPERATION_PILLARS");
    expect(socialPage).toContain("SocialShareActions");
    expect(adminSocial).toContain("requireAdminUser");
    expect(adminSocial).toContain("SocialTemplateBoard");
    expect(envExample).toContain("NEXT_PUBLIC_X_PROFILE_URL=");
    expect(envExample).not.toContain("SOCIAL_ACCESS_TOKEN");
  });

  test("SNS運用資料は自然拡散と投稿前チェックを前提にしている", async () => {
    const sop = await readFile(path.join(rootDir, "SNS_OPERATIONS_SOP.md"), "utf8");
    const calendar = await readFile(
      path.join(rootDir, "SOCIAL_CONTENT_CALENDAR.csv"),
      "utf8",
    );

    expect(sop).toContain("自動いいね、自動フォロー、自動リプライ");
    expect(sop).toContain("複数アカウントを使った不自然な拡散");
    expect(sop).toContain("未承認投稿の紹介");
    expect(sop).toContain("投稿前チェック");
    expect(calendar).toContain("day,slot,platform,post_type");
    expect(calendar).toContain("証拠画像と投稿者メールアドレスは一般公開しません");
    expect(calendar).not.toContain("reporter_email");
    expect(calendar).not.toContain("storage_path");
  });

  test("スポンサー問い合わせは公開ページに出さず管理ログで確認する", async () => {
    const sponsorAction = await readFile(
      path.join(rootDir, "src/app/sponsor/actions.ts"),
      "utf8",
    );
    const sponsorForm = await readFile(
      path.join(rootDir, "src/app/sponsor/sponsor-inquiry-form.tsx"),
      "utf8",
    );
    const adminSponsors = await readFile(
      path.join(rootDir, "src/app/admin/sponsors/page.tsx"),
      "utf8",
    );
    const adminData = await readFile(path.join(rootDir, "src/lib/admin/data.ts"), "utf8");

    expect(sponsorAction).toContain("isHoneypotFilled");
    expect(sponsorAction).toContain("SPONSOR_INQUIRY_ACTION");
    expect(sponsorAction).toContain('target_table: "sponsor_inquiries"');
    expect(sponsorAction).toContain("admin_actions");
    expect(sponsorForm).toContain('name="contact_email"');
    expect(sponsorForm).toContain("非公開で問い合わせる");
    expect(adminSponsors).toContain("requireAdminUser");
    expect(adminSponsors).toContain("getAdminSponsorInquiries");
    expect(adminData).toContain("getAdminSponsorInquiries");
  });

  test("構造化データとllms.txtは公開情報だけを扱う", async () => {
    const structuredData = await readFile(
      path.join(rootDir, "src/lib/structured-data.ts"),
      "utf8",
    );
    const jsonLd = await readFile(path.join(rootDir, "src/components/json-ld.tsx"), "utf8");
    const llmsRoute = await readFile(
      path.join(rootDir, "src/app/llms.txt/route.ts"),
      "utf8",
    );
    const sitemap = await readFile(path.join(rootDir, "src/app/sitemap.ts"), "utf8");

    expect(structuredData).toContain("SearchAction");
    expect(structuredData).toContain("FAQPage");
    expect(structuredData).toContain("承認済み投稿だけを公開します");
    expect(jsonLd).toContain('type="application/ld+json"');
    expect(jsonLd).toContain('replace(/</g, "\\\\u003c")');
    expect(llmsRoute).toContain("getLlmsText");
    expect(sitemap).toContain("/llms.txt");

    for (const privateToken of [
      "reporter_email",
      "private_note",
      "storage_path",
      "report-evidence-files",
    ]) {
      expect(structuredData).not.toContain(privateToken);
    }
  });

  test("公的・公式ソース調査キューは転載禁止と非公開デフォルト運用を明記する", async () => {
    const queue = await readFile(path.join(rootDir, "SOURCE_RESEARCH_QUEUE.csv"), "utf8");
    const playbook = await readFile(path.join(rootDir, "DATA_COLLECTION_PLAYBOOK.md"), "utf8");
    const researchLib = await readFile(path.join(rootDir, "src/lib/research-sources.ts"), "utf8");
    const sourcesPage = await readFile(path.join(rootDir, "src/app/sources/page.tsx"), "utf8");
    const adminResearch = await readFile(
      path.join(rootDir, "src/app/admin/research/page.tsx"),
      "utf8",
    );

    expect(queue).toContain("source_checked_at");
    expect(queue).toContain("本文・口コミ・画像・スクリーンショット");
    expect(playbook).toContain("実在店舗への注意報告を根拠なしに作ること");
    expect(playbook).toContain("status=pending");
    expect(playbook).toContain("evidence_level=Hidden");
    expect(researchLib).toContain("RESEARCH_SOURCES");
    expect(sourcesPage).toContain("ResearchSourceCard");
    expect(adminResearch).toContain("requireAdminUser");
    expect(adminResearch).toContain("getResearchSourceCsv");
  });

  test("AdSense導入口はデフォルトOFFでads.txtと配置ルールを文書化している", async () => {
    const envExample = await readFile(path.join(rootDir, ".env.example"), "utf8");
    const guide = await readFile(path.join(rootDir, "ADSENSE_SETUP_GUIDE.md"), "utf8");
    const adsenseGate = await readFile(
      path.join(rootDir, "src/components/adsense-gate.tsx"),
      "utf8",
    );
    const adsenseLib = await readFile(path.join(rootDir, "src/lib/adsense.ts"), "utf8");
    const adsTxtRoute = await readFile(
      path.join(rootDir, "src/app/ads.txt/route.ts"),
      "utf8",
    );

    expect(envExample).toContain("NEXT_PUBLIC_ADSENSE_ENABLED=false");
    expect(envExample).toContain("ADS_TXT_GOOGLE_PUBLISHER_ID=");
    expect(adsenseGate).toContain("isAdsenseEnabled");
    expect(adsenseLib).toContain('NEXT_PUBLIC_ADSENSE_ENABLED === "true"');
    expect(adsenseLib).toContain("ca-pub-");
    expect(adsenseLib).toContain("pub-");
    expect(adsTxtRoute).toContain("google.com,");
    expect(guide).toContain("広告クリックを促す文言を置かない");
    expect(guide).toContain("管理画面、投稿フォーム、異議申立てフォーム");
    expect(guide).toContain("How AdSense uses cookies");
  });

  test("初期データ投入は管理者限定で非公開デフォルトに固定する", async () => {
    const validator = await readFile(
      path.join(rootDir, "src/components/admin/initial-data-validator.tsx"),
      "utf8",
    );
    const actions = await readFile(
      path.join(rootDir, "src/app/admin/data/actions.ts"),
      "utf8",
    );
    const validationLib = await readFile(
      path.join(rootDir, "src/lib/initial-data-validation.ts"),
      "utf8",
    );
    const adminDataPage = await readFile(
      path.join(rootDir, "src/app/admin/data/page.tsx"),
      "utf8",
    );

    expect(validator).toContain('"use client"');
    expect(validator).toContain("validateInitialDataCsv");
    expect(validator).toContain("importInitialDataAction");
    expect(validator).not.toContain("createSupabase");
    expect(actions).toContain("requireAdminUser");
    expect(actions).toContain('const IMPORT_EVIDENCE_LEVEL = "Hidden"');
    expect(actions).toContain('new Set(["pending", "needs_review"])');
    expect(actions).toContain('reporter_email: INTERNAL_SEED_EMAIL');
    expect(actions).toContain("source_checked_at");
    expect(actions).toContain("initial_data_imported");
    expect(actions).not.toContain('status: "approved"');
    expect(validationLib).toContain("INITIAL_DATA_COLUMNS");
    expect(validationLib).toContain("containsDangerousExpression");
    expect(validationLib).toContain("isReportSourceType");
    expect(validationLib).toContain("Google口コミ");
    expect(adminDataPage).toContain("requireAdminUser");
    expect(adminDataPage).toContain("非公開デフォルト投入");
  });

  test("トラブル種別別ガイドは断定ではなく確認項目として実装する", async () => {
    const topicContent = await readFile(
      path.join(rootDir, "src/lib/topic-content.ts"),
      "utf8",
    );
    const topicPage = await readFile(
      path.join(rootDir, "src/app/topics/[slug]/page.tsx"),
      "utf8",
    );

    expect(topicContent).toContain("料金説明の確認");
    expect(topicContent).toContain("明細提示の確認");
    expect(topicContent).toContain("客引き経由の来店前確認");
    expect(topicContent).toContain("安全確保を優先");
    expect(topicPage).toContain("事実を断定");
    expect(topicPage).not.toContain("reporter_email");
    expect(topicPage).not.toContain("storage_path");
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
