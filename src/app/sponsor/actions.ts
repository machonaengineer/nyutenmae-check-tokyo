"use server";

import { isHoneypotFilled } from "@/lib/submission-protection";
import {
  SPONSOR_INQUIRY_ACTION,
  validateSponsorInquiryFormData,
} from "@/lib/sponsor-inquiry";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { SponsorInquiryFormState } from "./form-state";

export async function submitSponsorInquiryAction(
  _prevState: SponsorInquiryFormState,
  formData: FormData,
): Promise<SponsorInquiryFormState> {
  if (isHoneypotFilled(formData)) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      errors: {},
      values: {},
    };
  }

  const validation = validateSponsorInquiryFormData(formData);

  if (!validation.ok) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      errors: validation.errors,
      values: validation.values,
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data } = validation;
  const { error } = await supabase.from("admin_actions").insert({
    action: SPONSOR_INQUIRY_ACTION,
    target_table: "sponsor_inquiries",
    target_id: null,
    summary: `${data.organizationName} からスポンサー問い合わせが送信されました。`,
    metadata: {
      organization_name: data.organizationName,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      website_url: data.websiteUrl,
      sponsor_type: data.sponsorType,
      budget_range: data.budgetRange,
      message: data.message,
    },
  });

  if (error) {
    return {
      status: "error",
      message: "問い合わせの送信に失敗しました。時間を置いて再度お試しください。",
      errors: {},
      values: validation.values,
    };
  }

  return {
    status: "success",
    message:
      "問い合わせを受け付けました。掲載独立性と法務確認を前提に、管理者が内容を確認します。",
    errors: {},
    values: {
      organization_name: "",
      contact_name: "",
      contact_email: "",
      website_url: "",
      sponsor_type: "sponsor",
      budget_range: "undecided",
      message: "",
    },
  };
}
