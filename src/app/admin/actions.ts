"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin/auth";
import {
  isEvidenceLevel,
  isObjectionStatus,
  isReportStatus,
} from "@/lib/admin/types";
import { createSupabaseAdminClient, createSupabaseCookieServerClient } from "@/lib/supabase/server";

function getText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getStringList(formData: FormData, field: string) {
  return formData
    .getAll(field)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function writeAdminAction(options: {
  adminUserId: string;
  action: string;
  targetTable: string;
  targetId: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("admin_actions").insert({
    admin_user_id: options.adminUserId,
    action: options.action,
    target_table: options.targetTable,
    target_id: options.targetId,
    summary: options.summary,
    metadata: options.metadata ?? {},
  });
}

export async function signOutAdminAction() {
  const supabase = await createSupabaseCookieServerClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

export async function updateReportAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const reportId = getText(formData, "report_id");
  const publicSummary = getText(formData, "public_summary");
  const evidenceLevel = getText(formData, "evidence_level");
  const status = getText(formData, "status");
  const riskTagIds = getStringList(formData, "risk_tag_ids");

  if (!reportId || publicSummary.length < 10) {
    redirect(`/admin/reports/${reportId}?error=invalid`);
  }

  if (!isEvidenceLevel(evidenceLevel) || !isReportStatus(status)) {
    redirect(`/admin/reports/${reportId}?error=invalid`);
  }

  const supabase = createSupabaseAdminClient();
  const { error: updateError } = await supabase
    .from("reports")
    .update({
      public_summary: publicSummary,
      evidence_level: evidenceLevel,
      status,
    })
    .eq("id", reportId);

  if (updateError) {
    redirect(`/admin/reports/${reportId}?error=update_failed`);
  }

  await supabase.from("report_risk_tags").delete().eq("report_id", reportId);

  if (riskTagIds.length > 0) {
    const { error: tagError } = await supabase.from("report_risk_tags").insert(
      riskTagIds.map((riskTagId) => ({
        report_id: reportId,
        risk_tag_id: riskTagId,
      })),
    );

    if (tagError) {
      redirect(`/admin/reports/${reportId}?error=tag_failed`);
    }
  }

  await writeAdminAction({
    adminUserId: adminUser.id,
    action: "report_updated",
    targetTable: "reports",
    targetId: reportId,
    summary: `投稿を更新しました。ステータス: ${status}、証拠レベル: ${evidenceLevel}`,
    metadata: {
      status,
      evidence_level: evidenceLevel,
      risk_tag_count: riskTagIds.length,
    },
  });

  revalidatePath("/map");
  revalidatePath("/areas");
  revalidatePath(`/admin/reports/${reportId}`);
  revalidatePath("/admin/reports");
  redirect(`/admin/reports/${reportId}?saved=1`);
}

export async function setReportStatusAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const reportId = getText(formData, "report_id");
  const status = getText(formData, "status");

  if (!reportId || !isReportStatus(status)) {
    redirect("/admin/reports?error=invalid");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("reports").update({ status }).eq("id", reportId);

  if (error) {
    redirect(`/admin/reports/${reportId}?error=status_failed`);
  }

  await writeAdminAction({
    adminUserId: adminUser.id,
    action: "report_status_changed",
    targetTable: "reports",
    targetId: reportId,
    summary: `投稿ステータスを${status}に変更しました。`,
    metadata: { status },
  });

  revalidatePath("/map");
  revalidatePath("/areas");
  revalidatePath(`/admin/reports/${reportId}`);
  revalidatePath("/admin/reports");
  redirect(`/admin/reports/${reportId}?saved=1`);
}

export async function updateObjectionStatusAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const objectionId = getText(formData, "objection_id");
  const status = getText(formData, "status");

  if (!objectionId || !isObjectionStatus(status)) {
    redirect("/admin/objections?error=invalid");
  }

  const supabase = createSupabaseAdminClient();
  const updatePayload: {
    status: string;
    resolved_at?: string | null;
  } = {
    status,
  };

  if (status === "resolved" || status === "rejected") {
    updatePayload.resolved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("objections")
    .update(updatePayload)
    .eq("id", objectionId);

  if (error) {
    redirect("/admin/objections?error=update_failed");
  }

  await writeAdminAction({
    adminUserId: adminUser.id,
    action: "objection_status_changed",
    targetTable: "objections",
    targetId: objectionId,
    summary: `異議申立てステータスを${status}に変更しました。`,
    metadata: { status },
  });

  revalidatePath("/admin/objections");
  redirect("/admin/objections?saved=1");
}
