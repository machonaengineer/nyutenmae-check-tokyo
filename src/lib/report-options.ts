import { INITIAL_AREAS, RISK_TAGS } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FormOption = {
  value: string;
  label: string;
  description?: string;
};

export type ReportFormOptions = {
  areas: FormOption[];
  riskTags: FormOption[];
};

export async function getReportFormOptions(): Promise<ReportFormOptions> {
  try {
    const supabase = createSupabaseServerClient();
    const [areasResult, riskTagsResult] = await Promise.all([
      supabase
        .from("areas")
        .select("slug,name,description")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("risk_tags")
        .select("slug,label")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

    return {
      areas:
        areasResult.data?.map((area) => ({
          value: area.slug,
          label: area.name,
          description: area.description ?? undefined,
        })) ?? getStaticAreas(),
      riskTags:
        riskTagsResult.data?.map((tag) => ({
          value: tag.slug,
          label: tag.label,
        })) ?? getStaticRiskTags(),
    };
  } catch {
    return {
      areas: getStaticAreas(),
      riskTags: getStaticRiskTags(),
    };
  }
}

function getStaticAreas(): FormOption[] {
  return INITIAL_AREAS.map((area) => ({
    value: area.slug,
    label: area.name,
    description: area.summary,
  }));
}

function getStaticRiskTags(): FormOption[] {
  return RISK_TAGS.map((tag) => ({
    value: tag.slug,
    label: tag.label,
  }));
}
