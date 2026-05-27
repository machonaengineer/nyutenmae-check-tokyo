import { getAreaDeepGuides } from "@/lib/area-content";
import { INITIAL_AREAS } from "@/lib/site";
import { RESEARCH_SOURCES } from "@/lib/research-sources";

export type AreaCollectionTrack =
  | "official_source"
  | "user_report"
  | "building_review"
  | "content_depth";

export type AreaOperationStatus =
  | "not_started"
  | "in_progress"
  | "needs_review"
  | "publish_candidate"
  | "on_hold";

export type SourceFreshness = "fresh" | "review_soon" | "stale" | "missing";

export type AreaOperationTask = {
  id: string;
  areaSlug: string;
  areaName: string;
  track: AreaCollectionTrack;
  trackLabel: string;
  priority: "high" | "medium" | "low";
  status: AreaOperationStatus;
  statusLabel: string;
  researchQuestion: string;
  acceptableSources: string;
  nonPublicFields: string;
  nextAction: string;
  safeHandling: string;
};

export type AreaOperationSummary = {
  areaSlug: string;
  areaName: string;
  sourceFreshness: SourceFreshness;
  sourceFreshnessLabel: string;
  areaSpecificSources: number;
  commonSources: number;
  highPrioritySources: number;
  lastSourceCheckedAt: string | null;
  nextSourceCheckAt: string | null;
  publicRoutes: string[];
  nextPriorityAction: string;
  tasks: AreaOperationTask[];
};

export type AreaOperationDashboard = {
  summaries: AreaOperationSummary[];
  tasks: AreaOperationTask[];
  metrics: {
    totalAreas: number;
    totalTasks: number;
    highPriorityTasks: number;
    needsReviewTasks: number;
    publishCandidateTasks: number;
    staleSourceAreas: number;
    missingSourceAreas: number;
  };
};

export const AREA_COLLECTION_TRACKS: readonly {
  track: AreaCollectionTrack;
  label: string;
  description: string;
}[] = [
  {
    track: "official_source",
    label: "公式ソース",
    description: "自治体、警察、消費生活相談などの公式確認先を確認します。",
  },
  {
    track: "user_report",
    label: "投稿導線",
    description: "本人投稿を pending / Hidden で受け、管理者審査へ回します。",
  },
  {
    track: "building_review",
    label: "建物確認",
    description: "住所、建物名、階数、同一住所候補を確認します。",
  },
  {
    track: "content_depth",
    label: "コンテンツ増強",
    description: "投稿が少ない段階でも確認リストと相談導線を厚くします。",
  },
] as const;

export const AREA_OPERATION_STATUSES: readonly {
  status: AreaOperationStatus;
  label: string;
  description: string;
}[] = [
  {
    status: "not_started",
    label: "未調査",
    description: "まだ具体的な確認作業に入っていない状態です。",
  },
  {
    status: "in_progress",
    label: "調査中",
    description: "公式URL、投稿導線、建物情報などを確認中です。",
  },
  {
    status: "needs_review",
    label: "審査待ち",
    description: "管理者が公開可否、表現、出典、非公開情報を確認する状態です。",
  },
  {
    status: "publish_candidate",
    label: "公開候補",
    description: "公開ページへ反映済み、または公開前の最終確認対象です。",
  },
  {
    status: "on_hold",
    label: "保留",
    description: "出典不足、法務確認、異議申立てなどで進行を止める状態です。",
  },
] as const;

const SOURCE_RECHECK_INTERVAL_DAYS = 45;
const SOURCE_STALE_DAYS = 90;

const statusLabelMap = new Map(
  AREA_OPERATION_STATUSES.map((status) => [status.status, status.label]),
);

const trackLabelMap = new Map(
  AREA_COLLECTION_TRACKS.map((track) => [track.track, track.label]),
);

function getStatusLabel(status: AreaOperationStatus) {
  return statusLabelMap.get(status) ?? status;
}

export function getAreaCollectionTrackLabel(track: AreaCollectionTrack) {
  return trackLabelMap.get(track) ?? track;
}

export function getAreaOperationStatusLabel(status: AreaOperationStatus) {
  return getStatusLabel(status);
}

function getAreaSpecificSources(areaSlug: string) {
  return RESEARCH_SOURCES.filter((source) => source.areaSlug === areaSlug);
}

function getCommonSources() {
  return RESEARCH_SOURCES.filter((source) => source.areaSlug === "all");
}

function parseYmd(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toYmd(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = parseYmd(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toYmd(date);
}

function getDaysSince(value: string) {
  const now = new Date();
  const checkedAt = parseYmd(value);
  return Math.floor((now.getTime() - checkedAt.getTime()) / 86_400_000);
}

function getLatestSourceCheckedAt(areaSlug: string) {
  const dates = [...getAreaSpecificSources(areaSlug), ...getCommonSources()]
    .map((source) => source.sourceCheckedAt)
    .sort();

  return dates.at(-1) ?? null;
}

function getSourceFreshness(lastSourceCheckedAt: string | null): SourceFreshness {
  if (!lastSourceCheckedAt) {
    return "missing";
  }

  const daysSince = getDaysSince(lastSourceCheckedAt);

  if (daysSince > SOURCE_STALE_DAYS) {
    return "stale";
  }

  if (daysSince > SOURCE_RECHECK_INTERVAL_DAYS) {
    return "review_soon";
  }

  return "fresh";
}

function getSourceFreshnessLabel(freshness: SourceFreshness) {
  switch (freshness) {
    case "fresh":
      return "確認日あり";
    case "review_soon":
      return "再確認予定";
    case "stale":
      return "再確認優先";
    case "missing":
      return "公式ソース不足";
  }
}

function getTrackPriority(track: AreaCollectionTrack, areaSlug: string) {
  if (track === "official_source" || track === "user_report") {
    return "high" as const;
  }

  if (track === "building_review" && areaSlug === "shinjuku-kabukicho") {
    return "high" as const;
  }

  return "medium" as const;
}

function getTaskStatus(
  track: AreaCollectionTrack,
  areaSlug: string,
  sourceFreshness: SourceFreshness,
): AreaOperationStatus {
  if (track === "content_depth") {
    return "publish_candidate";
  }

  if (track === "official_source") {
    if (sourceFreshness === "missing" || sourceFreshness === "stale") {
      return "needs_review";
    }

    return "in_progress";
  }

  if (track === "building_review") {
    return areaSlug === "shinjuku-kabukicho" ? "needs_review" : "in_progress";
  }

  return "not_started";
}

function getResearchQuestion(track: AreaCollectionTrack, areaName: string) {
  switch (track) {
    case "official_source":
      return `${areaName}の公式確認先、相談導線、確認日は最新か`;
    case "user_report":
      return `${areaName}で料金説明、会計確認、明細提示に関する本人報告を安全に受けられるか`;
    case "building_review":
      return `${areaName}で住所、建物名、階数、同一住所候補を公開前に確認できるか`;
    case "content_depth":
      return `${areaName}で投稿が少ない段階でも入店前確認と記録保存の価値を提供できるか`;
  }
}

function getAcceptableSources(track: AreaCollectionTrack) {
  switch (track) {
    case "official_source":
      return "自治体公式、警察公式、消費生活相談公式、許諾済みまたは引用範囲を守った報道URL";
    case "user_report":
      return "本人投稿、レシート、明細、カード控え、料金表、来店日時、同行者情報";
    case "building_review":
      return "承認前DB、管理者メモ、公式住所確認、地図上の公開住所情報";
    case "content_depth":
      return "公式注意喚起、相談窓口、投稿傾向の抽象化、管理者レビュー";
  }
}

function getNonPublicFields(track: AreaCollectionTrack) {
  switch (track) {
    case "official_source":
      return "外部本文、口コミ本文、画像、スクリーンショット、個人情報";
    case "user_report":
      return "投稿者メール、証拠画像URL、店員個人名、顔写真、電話番号、SNS ID";
    case "building_review":
      return "非公開メモ、未承認投稿、証拠ファイルの保存パス";
    case "content_depth":
      return "外部本文コピー、個人情報、店舗や個人への断定表現";
  }
}

function getNextAction(track: AreaCollectionTrack, areaSlug: string, areaName: string) {
  switch (track) {
    case "official_source":
      return `${areaName}の公式URLを確認し、確認日を更新して独自要約だけを反映する。`;
    case "user_report":
      return `/areas/${areaSlug}/contribute と /reports/new からの投稿を pending / Hidden のまま審査する。`;
    case "building_review":
      return `公開前に住所、建物名、階数を補足し、同一住所候補は断定せず管理者確認に留める。`;
    case "content_depth":
      return `/areas/${areaSlug}/evidence と /areas/${areaSlug}/checklist の確認項目を更新する。`;
  }
}

function getSafeHandling(track: AreaCollectionTrack) {
  switch (track) {
    case "official_source":
      return "出典URL、確認日、独自要約だけを扱い、本文転載は禁止しない。";
    case "user_report":
      return "非公開デフォルトで保存し、承認済み投稿だけを公開する。";
    case "building_review":
      return "同一住所や同一建物は確認候補であり、同一運営とは断定しない。";
    case "content_depth":
      return "店舗名を増やさず、確認項目、保存資料、相談導線として一般化する。";
  }
}

function buildAreaTasks(
  areaSlug: string,
  areaName: string,
  sourceFreshness: SourceFreshness,
): AreaOperationTask[] {
  return AREA_COLLECTION_TRACKS.map(({ track }) => {
    const status = getTaskStatus(track, areaSlug, sourceFreshness);

    return {
      id: `${areaSlug}:${track}`,
      areaSlug,
      areaName,
      track,
      trackLabel: getAreaCollectionTrackLabel(track),
      priority: getTrackPriority(track, areaSlug),
      status,
      statusLabel: getStatusLabel(status),
      researchQuestion: getResearchQuestion(track, areaName),
      acceptableSources: getAcceptableSources(track),
      nonPublicFields: getNonPublicFields(track),
      nextAction: getNextAction(track, areaSlug, areaName),
      safeHandling: getSafeHandling(track),
    };
  });
}

export function getAreaOperationSummaries(): AreaOperationSummary[] {
  const commonSources = getCommonSources();

  return getAreaDeepGuides().map((guide) => {
    const areaSpecificSources = getAreaSpecificSources(guide.slug);
    const allSources = [...areaSpecificSources, ...commonSources];
    const lastSourceCheckedAt = getLatestSourceCheckedAt(guide.slug);
    const sourceFreshness = getSourceFreshness(lastSourceCheckedAt);
    const tasks = buildAreaTasks(guide.slug, guide.name, sourceFreshness);
    const area = INITIAL_AREAS.find((item) => item.slug === guide.slug);

    return {
      areaSlug: guide.slug,
      areaName: guide.name,
      sourceFreshness,
      sourceFreshnessLabel: getSourceFreshnessLabel(sourceFreshness),
      areaSpecificSources: areaSpecificSources.length,
      commonSources: commonSources.length,
      highPrioritySources: allSources.filter((source) => source.priority === "high").length,
      lastSourceCheckedAt,
      nextSourceCheckAt: lastSourceCheckedAt
        ? addDays(lastSourceCheckedAt, SOURCE_RECHECK_INTERVAL_DAYS)
        : null,
      publicRoutes: [
        `/areas/${guide.slug}`,
        `/areas/${guide.slug}/checklist`,
        `/areas/${guide.slug}/evidence`,
        `/areas/${guide.slug}/contribute`,
      ],
      nextPriorityAction:
        sourceFreshness === "stale" || sourceFreshness === "missing"
          ? "公式確認先の再確認を優先する。"
          : area?.summary ?? "公開済みガイドと情報提供導線を確認する。",
      tasks,
    };
  });
}

export function getAreaOperationDashboard(): AreaOperationDashboard {
  const summaries = getAreaOperationSummaries();
  const tasks = summaries.flatMap((summary) => summary.tasks);

  return {
    summaries,
    tasks,
    metrics: {
      totalAreas: summaries.length,
      totalTasks: tasks.length,
      highPriorityTasks: tasks.filter((task) => task.priority === "high").length,
      needsReviewTasks: tasks.filter((task) => task.status === "needs_review").length,
      publishCandidateTasks: tasks.filter((task) => task.status === "publish_candidate")
        .length,
      staleSourceAreas: summaries.filter((summary) => summary.sourceFreshness === "stale")
        .length,
      missingSourceAreas: summaries.filter((summary) => summary.sourceFreshness === "missing")
        .length,
    },
  };
}

export function filterAreaOperationTasks(
  tasks: AreaOperationTask[],
  filters: {
    areaSlug?: string;
    status?: AreaOperationStatus;
    track?: AreaCollectionTrack;
  },
) {
  return tasks.filter((task) => {
    if (filters.areaSlug && task.areaSlug !== filters.areaSlug) {
      return false;
    }

    if (filters.status && task.status !== filters.status) {
      return false;
    }

    if (filters.track && task.track !== filters.track) {
      return false;
    }

    return true;
  });
}

export function getAreaOperationCsv() {
  const header = [
    "area_slug",
    "area_name",
    "track",
    "operation_status",
    "priority",
    "last_source_checked_at",
    "next_source_check_at",
    "research_question",
    "acceptable_sources",
    "non_public_fields",
    "next_action",
  ];

  const rows = getAreaOperationSummaries().flatMap((summary) =>
    summary.tasks.map((task) => [
      task.areaSlug,
      task.areaName,
      task.track,
      task.status,
      task.priority,
      summary.lastSourceCheckedAt ?? "",
      summary.nextSourceCheckAt ?? "",
      task.researchQuestion,
      task.acceptableSources,
      task.nonPublicFields,
      task.nextAction,
    ]),
  );

  return [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replaceAll("\"", "\"\"")}"`).join(","))
    .join("\n");
}

export function isAreaOperationStatus(value: string): value is AreaOperationStatus {
  return AREA_OPERATION_STATUSES.some((status) => status.status === value);
}

export function isAreaCollectionTrack(value: string): value is AreaCollectionTrack {
  return AREA_COLLECTION_TRACKS.some((track) => track.track === value);
}
