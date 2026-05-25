"use server";

import { redirect } from "next/navigation";
import { processEvidenceFile } from "@/lib/evidence-image-processing";
import {
  EVIDENCE_BUCKET,
  getMaxUploadMb,
  validateReportFormData,
} from "@/lib/report-form";
import {
  enforceSubmissionRateLimit,
  isHoneypotFilled,
} from "@/lib/submission-protection";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { ReportFormState } from "./form-state";

async function cleanupFailedSubmission(options: {
  reportId?: string;
  placeId?: string;
  uploadedPaths: string[];
}) {
  const supabase = createSupabaseAdminClient();

  if (options.uploadedPaths.length > 0) {
    await supabase.storage.from(EVIDENCE_BUCKET).remove(options.uploadedPaths);
  }

  if (options.reportId) {
    await supabase.from("reports").delete().eq("id", options.reportId);
  }

  if (options.placeId) {
    await supabase.from("places").delete().eq("id", options.placeId);
  }
}

export async function submitReportAction(
  _prevState: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  if (isHoneypotFilled(formData)) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      errors: {},
      values: {},
    };
  }

  const validation = validateReportFormData(formData, {
    maxUploadMb: getMaxUploadMb(),
  });

  if (!validation.ok) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      errors: validation.errors,
      values: validation.values,
    };
  }

  const rateLimit = await enforceSubmissionRateLimit({
    kind: "report",
    email: validation.data.reporterEmail,
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
  const uploadedPaths: string[] = [];

  const { data: area, error: areaError } = await supabase
    .from("areas")
    .select("id")
    .eq("slug", data.areaSlug)
    .eq("is_active", true)
    .single();

  if (areaError || !area) {
    return {
      status: "error",
      message: "対象エリアを確認できませんでした。時間を置いて再度お試しください。",
      errors: {
        area_slug: ["対象エリアを確認できませんでした。"],
      },
      values: validation.values,
    };
  }

  const { data: place, error: placeError } = await supabase
    .from("places")
    .insert({
      area_id: area.id,
      shop_name: data.shopName,
      address: data.address,
      google_maps_url: data.googleMapsUrl,
      building_name: data.buildingName,
      floor: data.floor,
    })
    .select("id")
    .single();

  if (placeError || !place) {
    return {
      status: "error",
      message: "場所情報の保存に失敗しました。時間を置いて再度お試しください。",
      errors: {},
      values: validation.values,
    };
  }

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      place_id: place.id,
      area_id: area.id,
      status: "pending",
      evidence_level: "Hidden",
      shop_name: data.shopName,
      address: data.address,
      google_maps_url: data.googleMapsUrl,
      building_name: data.buildingName,
      floor: data.floor,
      visited_at: data.visitedAt,
      party_size: data.partySize,
      was_solicited: data.wasSolicited,
      solicitation_description: data.solicitationDescription,
      price_explained_before_entry: data.priceExplainedBeforeEntry,
      explanation_inside_store: data.explanationInsideStore,
      actual_billed_amount: data.actualBilledAmount,
      ordered_items: data.orderedItems,
      fee_explanation_status: data.feeExplanationStatus,
      receipt_available: data.receiptAvailable,
      itemized_bill_available: data.itemizedBillAvailable,
      payment_method: data.paymentMethod,
      checkout_response: data.checkoutResponse,
      exit_response: data.exitResponse,
      felt_intimidated: data.feltIntimidated,
      had_companions: data.hadCompanions,
      consulted_police: data.consultedPolice,
      consulted_consumer_center: data.consultedConsumerCenter,
      consulted_card_company: data.consultedCardCompany,
      reporter_email: data.reporterEmail,
      public_summary: data.publicSummary,
      private_note: data.privateNote,
    })
    .select("id")
    .single();

  if (reportError || !report) {
    await cleanupFailedSubmission({ placeId: place.id, uploadedPaths });

    return {
      status: "error",
      message: "投稿内容の保存に失敗しました。時間を置いて再度お試しください。",
      errors: {},
      values: validation.values,
    };
  }

  try {
    for (const file of data.files) {
      const processedFile = await processEvidenceFile(file);
      const storagePath = `${report.id}/${processedFile.fileName}`;
      const uploadResult = await supabase.storage
        .from(EVIDENCE_BUCKET)
        .upload(storagePath, processedFile.buffer, {
          contentType: processedFile.contentType,
          upsert: false,
        });

      if (uploadResult.error) {
        throw uploadResult.error;
      }

      uploadedPaths.push(storagePath);

      const evidenceResult = await supabase.from("report_evidence_files").insert({
        report_id: report.id,
        storage_bucket: EVIDENCE_BUCKET,
        storage_path: storagePath,
        original_file_name: processedFile.fileName,
        content_type: processedFile.contentType,
        file_size_bytes: processedFile.fileSizeBytes,
      });

      if (evidenceResult.error) {
        throw evidenceResult.error;
      }
    }

    if (data.riskTagSlugs.length > 0) {
      const { data: tags, error: tagsError } = await supabase
        .from("risk_tags")
        .select("id,slug")
        .in("slug", data.riskTagSlugs)
        .eq("is_active", true);

      if (tagsError) {
        throw tagsError;
      }

      if (!tags || tags.length !== data.riskTagSlugs.length) {
        throw new Error("Unknown risk tag was submitted.");
      }

      const joinRows = tags.map((tag) => ({
        report_id: report.id,
        risk_tag_id: tag.id,
      }));

      const { error: reportTagsError } = await supabase
        .from("report_risk_tags")
        .insert(joinRows);

      if (reportTagsError) {
        throw reportTagsError;
      }
    }

    await supabase.from("admin_actions").insert({
      action: "report_submitted",
      target_table: "reports",
      target_id: report.id,
      summary: "投稿フォームから注意報告が送信されました。",
      metadata: {
        risk_tag_count: data.riskTagSlugs.length,
        evidence_file_count: data.files.length,
      },
    });
  } catch {
    await cleanupFailedSubmission({
      reportId: report.id,
      placeId: place.id,
      uploadedPaths,
    });

    return {
      status: "error",
      message: "証拠画像またはタグの保存に失敗しました。時間を置いて再度お試しください。",
      errors: {},
      values: validation.values,
    };
  }

  redirect("/reports/thanks");
}
