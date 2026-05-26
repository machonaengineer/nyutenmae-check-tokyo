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
});
