import { expect, test } from "@playwright/test";
import {
  REPORT_CONTACT_EMAIL_FIELD,
  REPORT_SUPPLEMENTAL_NOTE_FIELD,
  validateReportFormData,
} from "../src/lib/report-form";
import {
  OBJECTION_SUPPLEMENTAL_NOTE_FIELD,
  validateObjectionFormData,
} from "../src/lib/objection-form";
import { validateSponsorInquiryFormData } from "../src/lib/sponsor-inquiry";

test.describe("公開フォームの入力名変換", () => {
  test("投稿フォームの公開nameをDB保存用データへ変換できる", () => {
    const formData = new FormData();
    formData.set("area_slug", "shinjuku-kabukicho");
    formData.set("shop_name", "本番前確認用店舗");
    formData.set("public_summary", "投稿者の申告に基づくフォーム検証用の注意報告です。料金説明と会計確認に関する内容です。");
    formData.set(REPORT_CONTACT_EMAIL_FIELD, "reporter@example.com");
    formData.set(REPORT_SUPPLEMENTAL_NOTE_FIELD, "公開しない補足です。");

    const result = validateReportFormData(formData);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.reporterEmail).toBe("reporter@example.com");
      expect(result.data.privateNote).toBe("公開しない補足です。");
    }
  });

  test("異議申立てフォームの公開nameをDB保存用データへ変換できる", () => {
    const formData = new FormData();
    formData.set("target_url", "/places/00000000-0000-4000-8000-000000000000");
    formData.set("requester_email", "requester@example.com");
    formData.set("reason_category", "fact_check");
    formData.set("details", "投稿者の申告内容について確認を依頼するためのフォーム検証用テキストです。対象箇所と確認理由を記載しています。");
    formData.set(OBJECTION_SUPPLEMENTAL_NOTE_FIELD, "公開しない補足です。");

    const result = validateObjectionFormData(formData);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.requesterEmail).toBe("requester@example.com");
      expect(result.data.privateNote).toBe("公開しない補足です。");
    }
  });

  test("スポンサー問い合わせフォームの公開nameを管理ログ保存用データへ変換できる", () => {
    const formData = new FormData();
    formData.set("organization_name", "確認用支援企業");
    formData.set("contact_name", "確認担当");
    formData.set("contact_email", "sponsor@example.com");
    formData.set("website_url", "https://example.com");
    formData.set("sponsor_type", "sponsor");
    formData.set("budget_range", "10000_30000");
    formData.set("message", "掲載独立性を前提に、入店前確認の情報整備を支援したいという相談内容です。");

    const result = validateSponsorInquiryFormData(formData);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.organizationName).toBe("確認用支援企業");
      expect(result.data.contactEmail).toBe("sponsor@example.com");
      expect(result.data.websiteUrl).toBe("https://example.com");
    }
  });
});
