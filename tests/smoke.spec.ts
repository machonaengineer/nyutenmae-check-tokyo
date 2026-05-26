import { expect, test } from "@playwright/test";

const publicRoutes = [
  { path: "/", heading: "入店前チェック東京" },
  { path: "/map", heading: "注意報告マップ" },
  { path: "/areas", heading: "初期対象エリア" },
  { path: "/areas/shinjuku-kabukicho", heading: "新宿・歌舞伎町" },
  { path: "/reports/new", heading: "注意報告を送る" },
  { path: "/reports/thanks", heading: "投稿を受け付けました" },
  { path: "/objection", heading: "異議申立て" },
  { path: "/guidelines", heading: "投稿ガイドライン" },
  { path: "/support", heading: "トラブル時の相談先" },
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
      await expect(page.getByRole("link", { name: "投稿する" }).first()).toBeVisible();
    });
  }

  test("トップページで公開方針を確認できる", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("投稿は自動公開しません。")).toBeVisible();
    await expect(page.getByText("証拠画像と投稿者メールアドレスは一般公開しません。")).toBeVisible();
    await expect(page.getByText("投稿者の申告に基づく情報です。")).toBeVisible();
  });

  test("星評価UIを表示しない", async ({ page }) => {
    for (const route of publicRoutes) {
      await page.goto(route.path);
      await expect(page.locator("body")).not.toContainText("★★★★★");
      await expect(page.locator("body")).not.toContainText("★");
    }
  });

  test("禁止表現を静的UIに表示しない", async ({ page }) => {
    for (const route of publicRoutes) {
      await page.goto(route.path);
      const bodyText = await page.locator("body").innerText();

      for (const term of prohibitedUiTerms) {
        expect(bodyText).not.toContain(term);
      }
    }
  });

  test("投稿フォームの主要項目を表示できる", async ({ page }) => {
    await page.goto("/reports/new");

    await expect(page.getByLabel("対象エリア")).toBeVisible();
    await expect(page.getByLabel("店舗名または場所の手がかり")).toBeVisible();
    await expect(page.getByLabel("公開用の報告概要")).toBeVisible();
    await expect(page.getByLabel("連絡用メールアドレス")).toBeVisible();
    await expect(page.getByLabel("証拠画像")).toBeVisible();
    await expect(page.getByRole("button", { name: "非公開で送信する" })).toBeVisible();
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

  test("相談導線ページで主要な相談先を確認できる", async ({ page }) => {
    await page.goto("/support");

    await expect(page.getByText("110").first()).toBeVisible();
    await expect(page.getByText("#9110").first()).toBeVisible();
    await expect(page.getByText("188").first()).toBeVisible();
    await expect(page.getByText("クレジットカード会社へ相談")).toBeVisible();
    await expect(page.getByText("支払い交渉より安全確保を優先")).toBeVisible();
  });

  test("主要ページで横スクロールが発生しない", async ({ page }) => {
    for (const route of ["/", "/reports/new", "/objection", "/support", "/map"]) {
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
    expect(body).toContain("Sitemap:");
  });

  test("sitemap.xmlに公開主要ページと初期エリアを含める", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();

    expect(response.ok()).toBe(true);
    expect(body).toContain("<loc>http://localhost:3000/</loc>");
    expect(body).toContain("<loc>http://localhost:3000/map</loc>");
    expect(body).toContain("<loc>http://localhost:3000/areas/shinjuku-kabukicho</loc>");
    expect(body).not.toContain("/admin");
    expect(body).not.toContain("/reports/thanks");
  });

  test("manifest.webmanifestでサイト名とテーマ色を返す", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    const manifest = await response.json();

    expect(response.ok()).toBe(true);
    expect(manifest.name).toBe("入店前チェック東京");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#1f3a5f");
  });
});
