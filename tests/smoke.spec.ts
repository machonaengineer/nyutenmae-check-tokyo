import { expect, test } from "@playwright/test";

const publicRoutes = [
  { path: "/", heading: "入店前チェック東京" },
  { path: "/map", heading: "注意報告マップ" },
  { path: "/areas", heading: "掲載対象エリア" },
  { path: "/areas/shinjuku-kabukicho", heading: "新宿・歌舞伎町の入店前チェック" },
  {
    path: "/areas/shinjuku-kabukicho/topics/price-confirmation",
    heading: "新宿・歌舞伎町の料金説明の確認",
  },
  { path: "/search", heading: "店舗名・住所・建物検索" },
  { path: "/checklists", heading: "入店前チェックリスト" },
  { path: "/guides", heading: "実用ガイド" },
  { path: "/faq", heading: "よくある質問" },
  {
    path: "/guides/before-entry-price-check",
    heading: "入店前の料金確認ガイド",
  },
  {
    path: "/areas/shinjuku-kabukicho/guides/before-entry-price-check",
    heading: "新宿・歌舞伎町の料金確認ガイド",
  },
  {
    path: "/areas/shinjuku-kabukicho/checklist",
    heading: "新宿・歌舞伎町の入店前チェックリスト",
  },
  {
    path: "/areas/roppongi-azabujuban/evidence",
    heading: "六本木・麻布十番の記録保存ガイド",
  },
  {
    path: "/areas/roppongi-azabujuban/contribute",
    heading: "六本木・麻布十番の情報提供",
  },
  { path: "/topics", heading: "トラブル種別別ガイド" },
  { path: "/topics/price-confirmation", heading: "料金説明の確認" },
  { path: "/contribute", heading: "情報提供のお願い" },
  { path: "/sources", heading: "情報ソース" },
  {
    path: "/sources/shinjuku-consumer-high-billing-consultation",
    heading: "新宿区の高額請求トラブル相談案内",
  },
  { path: "/coverage", heading: "情報蓄積状況" },
  { path: "/coverage/candidates", heading: "公開候補化の流れ" },
  { path: "/trust", heading: "透明性と安全運用" },
  { path: "/social", heading: "SNS共有・情報提供" },
  { path: "/sponsor", heading: "スポンサー・広告掲載について" },
  { path: "/roadmap", heading: "改善ロードマップ" },
  { path: "/reports/new", heading: "注意報告を送る" },
  { path: "/reports/quick", heading: "30秒で情報提供" },
  { path: "/reports/thanks", heading: "投稿を受け付けました" },
  { path: "/objection", heading: "異議申立て" },
  { path: "/guidelines", heading: "投稿ガイドライン" },
  { path: "/support", heading: "トラブル時の相談先" },
  { path: "/monetization-policy", heading: "収益化と掲載独立性" },
  { path: "/terms", heading: "利用規約" },
  { path: "/privacy", heading: "プライバシーポリシー" },
] as const;

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
] as const;

test.describe("公開ページ", () => {
  for (const route of publicRoutes) {
    test(`${route.path} を表示できる`, async ({ page }) => {
      await page.goto(route.path);

      await expect(
        page.getByRole("heading", { name: route.heading, level: 1 }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "情報提供" }).first()).toBeVisible();
    });
  }

  test("トップページで実用導線を確認できる", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("料金条件を確認", { exact: true })).toBeVisible();
    await expect(page.getByText("場所の手がかりで探せます")).toBeVisible();
    await expect(page.getByText("相談先につなげます")).toBeVisible();
    await expect(page.getByText("いま集めている情報")).toBeVisible();
    await expect(page.getByText("手がかりを送る")).toBeVisible();
    await expect(page.getByText("情報提供を募集しています。")).toBeVisible();
    await expect(page.getByRole("link", { name: "30秒で送る" })).toBeVisible();
    await expect(page.getByText("公式確認先")).toBeVisible();
    await expect(page.getByText("自治体、警察、消費生活相談")).toBeVisible();
  });

  test("エリア一覧で情報提供募集導線を確認できる", async ({ page }) => {
    await page.goto("/areas");

    await expect(page.getByText("公開情報を増やすために募集していること")).toBeVisible();
    await expect(page.getByText("このエリアの手がかりを送る").first()).toBeVisible();
    await expect(
      page.getByText("案内を受けた場所、入店した住所、建物名、階数"),
    ).toBeVisible();
  });

  test("星評価UIを表示しない", async ({ request }) => {
    for (const route of publicRoutes) {
      const response = await request.get(route.path);
      const body = await response.text();

      expect(response.ok()).toBe(true);
      expect(body).not.toContain("★★★★★");
      expect(body).not.toContain("★");
    }
  });

  test("禁止表現を静的UIに表示しない", async ({ request }) => {
    for (const route of publicRoutes) {
      const response = await request.get(route.path);
      const body = await response.text();

      expect(response.ok()).toBe(true);
      for (const term of prohibitedUiTerms) {
        expect(body).not.toContain(term);
      }
    }
  });

  test("投稿フォームの主要項目を表示できる", async ({ page }) => {
    await page.goto("/reports/new");

    await expect(page.getByLabel("対象エリア")).toBeVisible();
    await expect(page.getByLabel("店舗名または場所の手がかり")).toBeVisible();
    await expect(page.locator('input[name="building_name"]')).toBeVisible();
    await expect(page.locator('input[name="floor"]')).toBeVisible();
    await expect(page.getByLabel("公開用の報告概要")).toBeVisible();
    await expect(page.getByLabel("連絡用メールアドレス")).toBeVisible();
    await expect(page.getByLabel("証拠画像")).toBeVisible();
    await expect(page.getByRole("button", { name: "非公開で送信する" })).toBeVisible();
  });

  test("簡易情報提供フォームで店名以外の手がかりを案内する", async ({ page }) => {
    await page.goto("/reports/quick");

    await expect(page.getByText("店名がわからなくても送れる情報")).toBeVisible();
    await expect(
      page.getByText("店名が曖昧な場合は、住所、建物名、階数、入口表示"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "非公開で送信する" })).toBeVisible();
  });

  test("情報提供導線から投稿フォームを事前選択できる", async ({ page }) => {
    await page.goto("/reports/new?area=shinjuku-kabukicho&tag=price-billing-mismatch");

    await expect(page.getByLabel("対象エリア")).toHaveValue("shinjuku-kabukicho");
    await expect(
      page.locator('input[name="risk_tags"][value="price-billing-mismatch"]'),
    ).toBeChecked();
  });

  test("共通ヘッダーから店舗名・住所・建物を検索できる", async ({ page }) => {
    await page.goto("/");

    const searchForm = page.locator('form[role="search"]:visible').first();
    const searchInput = searchForm.locator('input[name="q"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("新宿");
    await searchForm.getByRole("button", { name: "検索" }).click();

    await expect(page).toHaveURL(/\/search\?q=/);
    await expect(
      page.getByRole("heading", { name: "店舗名・住所・建物検索", level: 1 }),
    ).toBeVisible();
  });

  test("共通ヘッダーの主要導線を絞って表示する", async ({ page }) => {
    await page.goto("/");

    const headerLinks = page.locator('nav[aria-label="主要ナビゲーション"] a');

    await expect(headerLinks).toHaveCount(7);
    await expect(headerLinks).toContainText([
      "ホーム",
      "地図",
      "エリア",
      "チェック",
      "実用ガイド",
      "相談先",
      "情報提供",
    ]);
  });

  test("地図ページで表示条件をURL連動で絞り込める", async ({ page }) => {
    await page.goto("/map");

    await expect(page.getByRole("heading", { name: "表示条件", level: 2 })).toBeVisible();
    await expect(page.getByText(/条件に一致する公開場所:/)).toBeVisible();

    await page.getByLabel("エリア").selectOption("shinjuku-kabukicho");
    await expect(page).toHaveURL(/area=shinjuku-kabukicho/);

    await page.getByLabel("報告タグ").selectOption("price");
    await expect(page).toHaveURL(/tag=price/);

    await page.getByLabel("証拠レベル").selectOption("A");
    await expect(page).toHaveURL(/evidence=A/);

    await page.getByLabel("キーワード").fill("歌舞伎町");
    await expect(page).toHaveURL(/q=/);

    await page.getByRole("button", { name: "条件をリセット" }).click();
    await expect(page).toHaveURL(/\/map$/);
  });

  test("検索結果ゼロでも関連エリアと公式確認先を表示できる", async ({ page }) => {
    await page.goto("/search?q=%E6%96%B0%E5%AE%BF");

    await expect(page.getByText("現在、承認済みの公開情報では一致する場所はありません。")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "関連する確認先", level: 2 }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /新宿・歌舞伎町/ })).toBeVisible();
    await expect(page.getByText("警視庁が、新宿周辺で飲食店を利用する際")).toBeVisible();
  });

  test("投稿フォームにhoneypotと画像accept制限がある", async ({ page }) => {
    await page.goto("/reports/new");

    await expect(page.locator('input[name="company_website"]')).toHaveCount(1);
    const accept = await page.getByLabel("証拠画像").getAttribute("accept");

    expect(accept).toContain("image/jpeg");
    expect(accept).toContain(".jpg");
    expect(accept).toContain(".heif");
  });

  test("投稿本文に危険表現が入ると注意を表示する", async ({ page }) => {
    await page.goto("/reports/new");

    await page
      .getByLabel("公開用の報告概要")
      .fill("料金説明と会計内容の不一致について確認してほしい詐欺店です。");

    await expect(page.getByTestId("dangerous-expression-warning")).toBeVisible();
    await expect(
      page.getByText("事実経過、金額、説明内容、確認状況に置き換えてください。"),
    ).toBeVisible();
  });

  test("異議申立てフォームを表示できる", async ({ page }) => {
    await page.goto("/objection?target_url=/places/example");

    await expect(page.locator('input[name="company_website"]')).toHaveCount(1);
    await expect(page.getByLabel("対象URLまたは投稿ID")).toHaveValue("/places/example");
    await expect(page.getByLabel("連絡用メールアドレス")).toBeVisible();
    await expect(page.getByLabel("申立て種別")).toBeVisible();
    await expect(page.getByLabel("申立て内容")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "非公開で申立てを送信する" }),
    ).toBeVisible();
  });

  test("スポンサー問い合わせフォームを表示できる", async ({ page }) => {
    await page.goto("/sponsor");

    await expect(page.locator('input[name="company_website"]')).toHaveCount(1);
    await expect(page.getByLabel("組織名")).toBeVisible();
    await expect(page.getByLabel("連絡用メールアドレス")).toBeVisible();
    await expect(page.getByLabel("相談種別")).toBeVisible();
    await expect(page.getByLabel("想定予算")).toBeVisible();
    await expect(page.getByLabel("相談内容")).toBeVisible();
    await expect(page.getByRole("button", { name: "非公開で問い合わせる" })).toBeVisible();
  });

  test("相談導線ページで主要な相談先を確認できる", async ({ page }) => {
    await page.goto("/support");

    await expect(page.getByText("110").first()).toBeVisible();
    await expect(page.getByText("#9110").first()).toBeVisible();
    await expect(page.getByText("188").first()).toBeVisible();
    await expect(page.getByText("クレジットカード会社へ相談")).toBeVisible();
    await expect(page.getByText("支払い交渉より安全確保を優先")).toBeVisible();
  });

  test("主要ページで横スクロールが発生しない", async ({ page }) => {
    for (const route of [
      "/",
      "/reports/new",
      "/objection",
      "/support",
      "/map",
      "/checklists",
      "/areas/shinjuku-kabukicho/checklist",
      "/areas/shinjuku-kabukicho/topics/price-confirmation",
      "/topics",
      "/topics/price-confirmation",
      "/contribute",
      "/sources",
      "/coverage",
      "/trust",
      "/social",
      "/sponsor",
      "/roadmap",
    ]) {
      await page.goto(route);
      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );

      expect(hasHorizontalOverflow).toBe(false);
    }
  });

  test("地図コンテナを表示できる", async ({ page }) => {
    await page.goto("/map");

    await expect(page.getByTestId("leaflet-map")).toBeVisible();
  });

  test("公開報告ゼロでも公式確認情報と投稿導線を表示する", async ({ page }) => {
    await page.goto("/map");

    await expect(
      page.getByText("この条件で表示できる場所はまだありません。エリア別の確認先と情報提供フォームを用意しています。"),
    ).toBeVisible();
    await expect(page.getByText("公式確認先:").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "情報提供する" }).first()).toBeVisible();
  });

  test("未ログインでは管理画面ログインに誘導される", async ({ page }) => {
    await page.goto("/admin/reports");

    await expect(
      page.getByRole("heading", { name: "管理画面ログイン", level: 1 }),
    ).toBeVisible();
  });

  test("robots.txtで管理画面と投稿完了ページをクロール対象外にする", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    const body = await response.text();

    expect(response.ok()).toBe(true);
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Disallow: /reports/thanks");
    expect(body).toContain("Disallow: /healthz");
    expect(body).toContain("Sitemap:");
  });

  test("healthzは監視用JSONを返しクロール対象外ヘッダーを付ける", async ({
    request,
  }) => {
    const response = await request.get("/healthz");
    const body = await response.json();

    expect(response.ok()).toBe(true);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("nyutenmae-check-tokyo");
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
  });

  test("管理系と投稿完了ページにnoindexヘッダーを付ける", async ({ request }) => {
    const thanks = await request.get("/reports/thanks");
    const admin = await request.get("/admin/reports", { maxRedirects: 0 });

    expect(thanks.headers()["x-robots-tag"]).toContain("noindex");
    expect(admin.headers()["x-robots-tag"]).toContain("noindex");
  });

  test("sitemap.xmlに公開主要ページと初期エリアを含める", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();

    expect(response.ok()).toBe(true);
    expect(body).toContain("<loc>http://localhost:3000/</loc>");
    expect(body).toContain("<loc>http://localhost:3000/map</loc>");
    expect(body).toContain("<loc>http://localhost:3000/checklists</loc>");
    expect(body).toContain("<loc>http://localhost:3000/faq</loc>");
    expect(body).toContain("<loc>http://localhost:3000/topics</loc>");
    expect(body).toContain("<loc>http://localhost:3000/topics/price-confirmation</loc>");
    expect(body).toContain("<loc>http://localhost:3000/contribute</loc>");
    expect(body).toContain("<loc>http://localhost:3000/sources</loc>");
    expect(body).toContain("<loc>http://localhost:3000/coverage</loc>");
    expect(body).toContain("<loc>http://localhost:3000/trust</loc>");
    expect(body).toContain("<loc>http://localhost:3000/social</loc>");
    expect(body).toContain("<loc>http://localhost:3000/sponsor</loc>");
    expect(body).toContain("<loc>http://localhost:3000/roadmap</loc>");
    expect(body).toContain("<loc>http://localhost:3000/llms.txt</loc>");
    expect(body).toContain("<loc>http://localhost:3000/monetization-policy</loc>");
    expect(body).toContain("<loc>http://localhost:3000/areas/shinjuku-kabukicho</loc>");
    expect(body).toContain(
      "<loc>http://localhost:3000/areas/shinjuku-kabukicho/checklist</loc>",
    );
    expect(body).toContain(
      "<loc>http://localhost:3000/areas/roppongi-azabujuban/evidence</loc>",
    );
    expect(body).toContain(
      "<loc>http://localhost:3000/areas/roppongi-azabujuban/contribute</loc>",
    );
    expect(body).toContain(
      "<loc>http://localhost:3000/areas/shinjuku-kabukicho/topics/price-confirmation</loc>",
    );
    expect(body).not.toContain("/admin");
    expect(body).not.toContain("/reports/thanks");
    expect(body).not.toContain("/healthz");
  });

  test("構造化データとllms.txtに公開方針を出し非公開情報を含めない", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const structuredData = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    expect(structuredData.join("\n")).toContain("SearchAction");
    expect(structuredData.join("\n")).toContain("FAQPage");

    const response = await request.get("/llms.txt");
    const body = await response.text();

    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("text/plain");
    expect(body).toContain("入店前チェック東京");
    expect(body).toContain("承認済み投稿だけを公開します");
    expect(body).toContain("Coverage:");
    expect(body).not.toContain("reporter_email");
    expect(body).not.toContain("private_note");
    expect(body).not.toContain("storage_path");
    expect(body).not.toContain("report-evidence-files");
  });

  test("ads.txtはAdSense未設定時に安全なコメントを返す", async ({ request }) => {
    const response = await request.get("/ads.txt");
    const body = await response.text();

    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("text/plain");
    expect(body).toContain("ads.txt is not configured");
    expect(body).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  test("manifest.webmanifestでサイト名とテーマ色を返す", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    const manifest = await response.json();

    expect(response.ok()).toBe(true);
    expect(manifest.name).toBe("入店前チェック東京");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#1f3a5f");
  });

  test("Open Graph画像を返す", async ({ request }) => {
    const response = await request.get("/opengraph-image");
    const dynamic = await request.get(
      "/og?title=%E5%85%A5%E5%BA%97%E5%89%8D%E3%83%81%E3%82%A7%E3%83%83%E3%82%AF&label=%E6%96%99%E9%87%91%E7%A2%BA%E8%AA%8D",
    );

    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
    expect(dynamic.ok()).toBe(true);
    expect(dynamic.headers()["content-type"]).toContain("image/png");
  });

  test("SNS共有ページで共有導線を表示する", async ({ page }) => {
    await page.goto("/social");

    await expect(page.getByRole("button", { name: "共有" })).toBeVisible();
    await expect(page.getByRole("button", { name: "URLコピー" })).toBeVisible();
    await expect(page.getByRole("link", { name: "X" })).toBeVisible();
    await expect(page.getByText("外部口コミ本文、ニュース本文、スクリーンショット")).toBeVisible();
  });

  test("未ログインではSNS管理画面ログインに誘導される", async ({ page }) => {
    await page.goto("/admin/social");

    await expect(
      page.getByRole("heading", { name: "管理画面ログイン", level: 1 }),
    ).toBeVisible();
  });

  test("未ログインではエリア運用管理画面ログインに誘導される", async ({ page }) => {
    await page.goto("/admin/area-ops");

    await expect(
      page.getByRole("heading", { name: "管理画面ログイン", level: 1 }),
    ).toBeVisible();
  });

  test("情報ソースページで転載禁止方針を確認できる", async ({ page }) => {
    await page.goto("/sources");

    await expect(page.getByText("本文、口コミ、画像、スクリーンショット")).toBeVisible();
    await expect(page.getByText("公式情報を確認する").first()).toBeVisible();
    await expect(page.getByText("確認日: 2026-05-27").first()).toBeVisible();
    await expect(page.getByText("エリア別の蓄積状況を見る")).toBeVisible();
  });

  test("情報蓄積状況ページでエリア別の確認状況を確認できる", async ({ page }) => {
    await page.goto("/coverage");

    await expect(page.getByText("公開件数だけでなく、確認先、相談導線、情報提供の受け口")).toBeVisible();
    await expect(page.getByText("審査待ち候補").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "情報ソースを見る" })).toBeVisible();
  });

  test("透明性ページで公開しない情報と審査方針を確認できる", async ({ page }) => {
    await page.goto("/trust");

    await expect(page.getByText("投稿者メールアドレス")).toBeVisible();
    await expect(page.getByText("証拠画像と保存先")).toBeVisible();
    await expect(page.getByText("投稿または候補を非公開で受け付ける")).toBeVisible();
    await expect(page.getByText("収益化は掲載判断や表示順位に影響しません。")).toBeVisible();
  });

  test("エリアページで公式確認先を確認できる", async ({ page }) => {
    await page.goto("/areas/shinjuku-kabukicho");

    await expect(
      page.getByRole("heading", { name: "このエリアの公式確認先", level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByText("警視庁が、新宿周辺で飲食店を利用する際").first(),
    ).toBeVisible();
    await expect(page.getByText("東京都の消費生活相談窓口案内です。").first()).toBeVisible();
  });

  test("公開フォームHTMLに非公開DBカラム名を埋め込まない", async ({ request }) => {
    for (const path of [
      "/reports/new",
      "/objection",
      "/sponsor",
      "/search?q=test",
      "/social",
      "/sources",
      "/coverage",
      "/trust",
      "/roadmap",
      "/areas/shinjuku-kabukicho",
      "/areas/roppongi-azabujuban/evidence",
      "/areas/roppongi-azabujuban/contribute",
    ]) {
      const response = await request.get(path);
      const body = await response.text();

      expect(response.ok()).toBe(true);
      expect(body).not.toContain("reporter_email");
      expect(body).not.toContain("private_note");
      expect(body).not.toContain("storage_path");
      expect(body).not.toContain("report-evidence-files");
      expect(body).not.toContain("sponsor_inquiry_submitted");
    }
  });

  test("収益化枠とVercel Analyticsはデフォルトでは公開HTMLに出さない", async ({
    request,
  }) => {
    const response = await request.get("/checklists");
    const body = await response.text();

    expect(response.ok()).toBe(true);
    expect(body).not.toContain("支援リンクを開く");
    expect(body).not.toContain("/_vercel/insights");
    expect(body).not.toContain("pagead2.googlesyndication.com");
    expect(body).not.toContain("adsbygoogle");
  });

  test("収益化方針ページで掲載独立性を確認できる", async ({ page }) => {
    await page.goto("/monetization-policy");

    await expect(page.getByText("投稿審査、公開順位、リスクタグ、証拠レベルに影響しません")).toBeVisible();
    await expect(page.getByText("現時点では、収益化枠は環境変数でOFF")).toBeVisible();
  });
});
