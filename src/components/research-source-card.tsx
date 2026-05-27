import {
  getResearchSourceIntakeStatus,
  type ResearchSource,
  type ResearchSourceIntakeStatus,
} from "@/lib/research-sources";

const sourceTypeLabels: Record<ResearchSource["sourceType"], string> = {
  public_agency: "公的機関",
  police: "警察",
  consumer_center: "消費生活相談",
  municipality: "自治体",
  news: "報道",
};

const priorityLabels: Record<ResearchSource["priority"], string> = {
  high: "優先",
  medium: "通常",
  low: "低",
};

const intakeStatusLabels: Record<ResearchSourceIntakeStatus, string> = {
  source_only: "出典確認用",
  candidate_needs_review: "候補審査中",
};

export function ResearchSourceCard({
  source,
  showNextAction = false,
}: {
  source: ResearchSource;
  showNextAction?: boolean;
}) {
  const intakeStatus = getResearchSourceIntakeStatus(source);

  return (
    <article className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-line bg-surface px-2 py-1 text-xs font-semibold text-muted">
          {sourceTypeLabels[source.sourceType]}
        </span>
        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
          {priorityLabels[source.priority]}
        </span>
        <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-muted">
          {intakeStatusLabels[intakeStatus]}
        </span>
        <span className="text-xs text-muted">確認日: {source.sourceCheckedAt}</span>
      </div>
      <h2 className="mt-3 text-lg font-bold text-ink">{source.sourceTitle}</h2>
      <p className="mt-3 text-sm leading-7 text-muted">{source.publicSummary}</p>
      <p className="mt-3 text-sm leading-7 text-muted">{source.suggestedUse}</p>
      <a
        className="mt-4 inline-flex text-sm font-semibold text-action"
        href={source.sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        {source.sourceType === "news" ? "出典を確認する" : "公式情報を確認する"}
      </a>
      {showNextAction ? (
        <div className="mt-4 rounded-md border border-line bg-surface p-3 text-sm leading-6 text-muted">
          {source.nextAction}
        </div>
      ) : null}
    </article>
  );
}
