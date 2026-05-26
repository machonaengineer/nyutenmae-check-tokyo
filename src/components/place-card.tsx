import Link from "next/link";
import { formatDate } from "@/lib/format";
import { getPlaceDisplayName, type PublicPlaceSummary } from "@/lib/public-data";

export function PlaceCard({ place }: { place: PublicPlaceSummary }) {
  const displayName = getPlaceDisplayName(place);

  return (
    <article className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgb(23_32_42/0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-action">{place.areaName}</p>
          <h2 className="mt-2 text-xl font-bold text-ink">
            <Link href={`/places/${place.id}`} className="text-ink no-underline hover:underline">
              {displayName}
            </Link>
          </h2>
          {place.address ? (
            <p className="mt-2 text-sm leading-6 text-muted">{place.address}</p>
          ) : null}
        </div>
        <div className="rounded-md border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink">
          報告{place.approvedReportCount}件
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
        <p>証拠レベル: {place.evidenceLevels.length ? place.evidenceLevels.join(" / ") : "確認中"}</p>
        <p>最新報告日: {formatDate(place.latestReportedAt)}</p>
      </div>

      {place.riskTags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {place.riskTags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-action/20 bg-action/5 px-2 py-1 text-xs font-medium text-action"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {place.latestPublicSummary ? (
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted">
          {place.latestPublicSummary}
        </p>
      ) : null}
    </article>
  );
}
