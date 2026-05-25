"use server";

import { validateObjectionFormData } from "@/lib/objection-form";
import {
  enforceSubmissionRateLimit,
  isHoneypotFilled,
} from "@/lib/submission-protection";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { ObjectionFormState } from "./form-state";

export async function submitObjectionAction(
  _prevState: ObjectionFormState,
  formData: FormData,
): Promise<ObjectionFormState> {
  if (isHoneypotFilled(formData)) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      errors: {},
      values: {},
    };
  }

  const validation = validateObjectionFormData(formData);

  if (!validation.ok) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      errors: validation.errors,
      values: validation.values,
    };
  }

  const rateLimit = await enforceSubmissionRateLimit({
    kind: "objection",
    email: validation.data.requesterEmail,
  });

  if (!rateLimit.allowed) {
    return {
      status: "error",
      message: rateLimit.message,
      errors: {},
      values: validation.values,
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data } = validation;

  const { data: objection, error } = await supabase
    .from("objections")
    .insert({
      report_id: data.reportId,
      target_url: data.targetUrl,
      requester_name: data.requesterName,
      requester_email: data.requesterEmail,
      requester_relationship: data.requesterRelationship,
      reason_category: data.reasonCategory,
      details: data.details,
      private_note: data.privateNote,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !objection) {
    return {
      status: "error",
      message: "異議申立ての送信に失敗しました。時間を置いて再度お試しください。",
      errors: {},
      values: validation.values,
    };
  }

  await supabase.from("admin_actions").insert({
    action: "objection_submitted",
    target_table: "objections",
    target_id: objection.id,
    summary: "異議申立てフォームから確認依頼が送信されました。",
    metadata: {
      reason_category: data.reasonCategory,
      has_report_id: Boolean(data.reportId),
      has_target_url: Boolean(data.targetUrl),
    },
  });

  return {
    status: "success",
    message:
      "異議申立てを受け付けました。管理者が対象内容を確認し、必要に応じて非公開化、表現修正、追加確認を行います。",
    errors: {},
    values: {
      report_id: "",
      target_url: "",
      requester_name: "",
      requester_email: "",
      requester_relationship: "",
      reason_category: "fact_check",
      details: "",
      private_note: "",
    },
  };
}
