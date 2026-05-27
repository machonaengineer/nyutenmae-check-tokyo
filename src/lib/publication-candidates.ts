import { getAreaGrowthPlan } from "@/lib/area-growth";
import { getResearchSourcesByArea } from "@/lib/research-sources";
import { INITIAL_AREAS } from "@/lib/site";

export const PUBLICATION_CANDIDATE_STAGES = [
  {
    label: "出典確認",
    description: "公式URL、報道URL、確認日を記録し、本文や画像は転載しない。",
  },
  {
    label: "独自要約",
    description: "外部本文をコピーせず、入店前確認や相談導線として短く言い換える。",
  },
  {
    label: "場所粒度確認",
    description: "個別店舗に進める前に、住所、建物名、階数、公開範囲を確認する。",
  },
  {
    label: "表現確認",
    description: "断定、個人情報、攻撃表現、未承認情報の混入がないか確認する。",
  },
  {
    label: "公開判断",
    description: "承認済み投稿またはエリア注意情報として、必要最小限だけ公開する。",
  },
] as const;

export function getPublicationCandidateRows() {
  return INITIAL_AREAS.map((area) => {
    const sources = getResearchSourcesByArea(area.slug);
    const growthPlan = getAreaGrowthPlan(area.slug);
    const highPrioritySources = sources.filter((source) => source.priority === "high");

    return {
      areaSlug: area.slug,
      areaName: area.name,
      sourceCount: sources.length,
      highPrioritySourceCount: highPrioritySources.length,
      proposedAsset: `${area.name}の入店前確認・相談導線`,
      nextAction:
        growthPlan?.adminNextAction ??
        "公式ソース、投稿導線、建物確認、表現確認を順に進める",
      publishableScope:
        growthPlan?.publicZeroStateValue ??
        "公開投稿が少ない段階でも、入店前確認と相談先を表示する",
    };
  });
}
