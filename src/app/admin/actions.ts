"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin/auth";
import {
  isEvidenceLevel,
  isObjectionStatus,
  isReportStatus,
} from "@/lib/admin/types";
import {
  isExternalCollectionMethod,
  parseNullableInteger,
  parseNullableNumber,
} from "@/lib/external-ratings";
import { fetchGooglePlaceRatingSnapshot } from "@/lib/google-places";
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

function getCheckbox(formData: FormData, field: string) {
  return getText(formData, field) === "on";
}

function getRedirectReportPath(reportId: string, suffix = "saved=1") {
  return `/admin/reports/${reportId}?${suffix}`;
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

async function findOrCreateExternalRef(options: {
  placeId: string;
  sourceId: string;
  externalPlaceId: string | null;
  sourceUrl: string | null;
  sourceTitle: string | null;
  collectionMethod: string;
  displayAllowed: boolean;
  privateMemo: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  if (!options.externalPlaceId && !options.sourceUrl) {
    return null;
  }

  let query = supabase
    .from("place_external_refs")
    .select("id")
    .eq("place_id", options.placeId)
    .eq("source_id", options.sourceId)
    .limit(1);

  if (options.externalPlaceId) {
    query = query.eq("external_place_id", options.externalPlaceId);
  } else if (options.sourceUrl) {
    query = query.eq("source_url", options.sourceUrl);
  }

  const existing = await query.maybeSingle();

  if (existing.data?.id) {
    await supabase
      .from("place_external_refs")
      .update({
        source_url: options.sourceUrl,
        source_title: options.sourceTitle,
        collection_method: options.collectionMethod,
        display_allowed: options.displayAllowed,
        private_memo: options.privateMemo,
      })
      .eq("id", existing.data.id);

    return existing.data.id as string;
  }

  const { data, error } = await supabase
    .from("place_external_refs")
    .insert({
      place_id: options.placeId,
      source_id: options.sourceId,
      external_place_id: options.externalPlaceId,
      source_url: options.sourceUrl,
      source_title: options.sourceTitle,
      collection_method: options.collectionMethod,
      display_allowed: options.displayAllowed,
      private_memo: options.privateMemo,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw error ?? new Error("External ref insert failed.");
  }

  return data.id as string;
}

export async function addExternalRatingSnapshotAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const reportId = getText(formData, "report_id");
  const placeId = getText(formData, "place_id");
  const sourceId = getText(formData, "source_id");
  const externalPlaceId = getText(formData, "external_place_id") || null;
  const sourceUrl = getText(formData, "source_url") || null;
  const sourceTitle = getText(formData, "source_title") || null;
  const checkedAt = getText(formData, "checked_at");
  const collectionMethod = getText(formData, "collection_method");
  const displayAllowed = getCheckbox(formData, "display_allowed");
  const ratingValue = parseNullableNumber(getText(formData, "rating_value"));
  const ratingScale = parseNullableNumber(getText(formData, "rating_scale")) ?? 5;
  const ratingCount = parseNullableInteger(getText(formData, "rating_count"));
  const attributionLabel = getText(formData, "attribution_label") || null;
  const publicNote = getText(formData, "public_note") || null;
  const privateMemo = getText(formData, "private_memo") || null;

  if (
    !reportId ||
    !placeId ||
    !sourceId ||
    !checkedAt ||
    !isExternalCollectionMethod(collectionMethod) ||
    ratingScale <= 0 ||
    ratingScale > 10 ||
    (ratingValue !== null && (ratingValue < 0 || ratingValue > ratingScale)) ||
    (displayAllowed && !sourceUrl) ||
    (publicNote && publicNote.length > 240)
  ) {
    redirect(getRedirectReportPath(reportId, "error=external_rating_invalid"));
  }

  const supabase = createSupabaseAdminClient();

  try {
    const externalRefId = await findOrCreateExternalRef({
      placeId,
      sourceId,
      externalPlaceId,
      sourceUrl,
      sourceTitle,
      collectionMethod,
      displayAllowed,
      privateMemo,
    });

    const { data, error } = await supabase
      .from("external_rating_snapshots")
      .insert({
        place_id: placeId,
        source_id: sourceId,
        external_ref_id: externalRefId,
        rating_value: ratingValue,
        rating_scale: ratingScale,
        rating_count: ratingCount,
        checked_at: new Date(checkedAt).toISOString(),
        source_url: sourceUrl,
        source_title: sourceTitle,
        collection_method: collectionMethod,
        display_allowed: displayAllowed,
        attribution_label: attributionLabel,
        public_note: publicNote,
        private_memo: privateMemo,
        created_by_admin: adminUser.id,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("External rating insert failed.");
    }

    await writeAdminAction({
      adminUserId: adminUser.id,
      action: "external_rating_snapshot_added",
      targetTable: "external_rating_snapshots",
      targetId: data.id as string,
      summary: "外部評価スナップショットを追加しました。",
      metadata: {
        place_id: placeId,
        source_id: sourceId,
        display_allowed: displayAllowed,
        collection_method: collectionMethod,
      },
    });
  } catch {
    redirect(getRedirectReportPath(reportId, "error=external_rating_failed"));
  }

  revalidatePath(`/places/${placeId}`);
  revalidatePath(`/admin/reports/${reportId}`);
  redirect(getRedirectReportPath(reportId));
}

export async function syncGoogleExternalRatingAction(formData: FormData) {
  const adminUser = await requireAdminUser();
  const reportId = getText(formData, "report_id");
  const placeId = getText(formData, "place_id");
  const googlePlaceId = getText(formData, "google_place_id");

  if (!reportId || !placeId || !googlePlaceId) {
    redirect(getRedirectReportPath(reportId, "error=google_sync_invalid"));
  }

  const supabase = createSupabaseAdminClient();

  try {
    const [{ data: source }, snapshot] = await Promise.all([
      supabase
        .from("external_review_sources")
        .select("id")
        .eq("slug", "google_maps")
        .single(),
      fetchGooglePlaceRatingSnapshot(googlePlaceId),
    ]);

    if (!source?.id) {
      throw new Error("Google Maps source is missing.");
    }

    const externalRefId = await findOrCreateExternalRef({
      placeId,
      sourceId: source.id as string,
      externalPlaceId: snapshot.googlePlaceId,
      sourceUrl: snapshot.sourceUrl,
      sourceTitle: snapshot.sourceTitle,
      collectionMethod: "official_api",
      displayAllowed: true,
      privateMemo: null,
    });

    const { data, error } = await supabase
      .from("external_rating_snapshots")
      .insert({
        place_id: placeId,
        source_id: source.id,
        external_ref_id: externalRefId,
        rating_value: snapshot.ratingValue,
        rating_scale: 5,
        rating_count: snapshot.ratingCount,
        checked_at: new Date().toISOString(),
        source_url: snapshot.sourceUrl,
        source_title: snapshot.sourceTitle,
        collection_method: "official_api",
        display_allowed: true,
        attribution_label: "Google",
        public_note: "Google マップ上の集計評価です。",
        private_memo: "Google Places APIから取得。",
        created_by_admin: adminUser.id,
      })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("Google snapshot insert failed.");
    }

    await writeAdminAction({
      adminUserId: adminUser.id,
      action: "google_external_rating_synced",
      targetTable: "external_rating_snapshots",
      targetId: data.id as string,
      summary: "Google Places APIから外部評価スナップショットを取得しました。",
      metadata: {
        place_id: placeId,
        google_place_id: googlePlaceId,
      },
    });
  } catch {
    redirect(getRedirectReportPath(reportId, "error=google_sync_failed"));
  }

  revalidatePath(`/places/${placeId}`);
  revalidatePath(`/admin/reports/${reportId}`);
  redirect(getRedirectReportPath(reportId));
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
