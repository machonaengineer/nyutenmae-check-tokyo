import {
  getResearchSourcePagePath,
  getResearchSourceIntakeStatus,
  RESEARCH_SOURCE_INTAKE_STATUS_LABELS,
  RESEARCH_SOURCE_PRIORITY_LABELS,
  RESEARCH_SOURCE_TYPE_LABELS,
  type ResearchSource,
} from "@/lib/research-sources";
import Link from "next/link";

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
          {RESEARCH_SOURCE_TYPE_LABELS[source.sourceType]}
        </span>
        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
          {RESEARCH_SOURCE_PRIORITY_LABELS[source.priority]}
        </span>
        <span className="rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-muted">
          {RESEARCH_SOURCE_INTAKE_STATUS_LABELS[intakeStatus]}
        </span>
        <span className="text-xs text-muted">確認日: {source.sourceCheckedAt}</span>
      </div>
      <h2 className="mt-3 text-lg font-bold text-ink">
        <Link
          className="text-ink no-underline transition hover:text-action"
          href={getResearchSourcePagePath(source)}
        >
          {source.sourceTitle}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted">{source.publicSummary}</p>
      <p className="mt-3 text-sm leading-7 text-muted">{source.suggestedUse}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          className="inline-flex text-sm font-semibold text-action"
          href={getResearchSourcePagePath(source)}
        >
          扱い方を見る
        </Link>
        <a
          className="inline-flex text-sm font-semibold text-action"
          href={source.sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          {source.sourceType === "news" ? "出典を確認する" : "公式情報を確認する"}
        </a>
      </div>
      {showNextAction ? (
        <div className="mt-4 rounded-md border border-line bg-surface p-3 text-sm leading-6 text-muted">
          {source.nextAction}
        </div>
      ) : null}
    </article>
  );
}
