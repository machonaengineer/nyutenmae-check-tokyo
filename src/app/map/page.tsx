import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { LeafletMap } from "@/components/leaflet-map";
import { PageHeader, Section } from "@/components/page-blocks";
import { PlaceCard } from "@/components/place-card";
import { PublicNotice } from "@/components/public-notice";
import { getAreaCenter, getPublicPlaceSummaries } from "@/lib/public-data";
import {
  getResearchSourceIntakeStatus,
  getResearchSourcePipelineMetrics,
  getResearchSourcesByArea,
} from "@/lib/research-sources";
import { createPageMetadata } from "@/lib/seo";
import { INITIAL_AREAS } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "注意マップ｜都内繁華街の入店前チェック",
  description:
    "都内繁華街で入店前に確認したい公開情報、エリア別の公式確認先、チェックリスト、情報提供導線を地図から確認できます。",
  path: "/map",
  imageLabel: "地図・エリア・相談先",
});

export default async function MapPage() {
  const places = await getPublicPlaceSummaries();
  const markerPlaces = places.filter(
    (place) => place.latitude !== null && place.longitude !== null,
  );
  const sourceMetrics = getResearchSourcePipelineMetrics();
  const areaSignals = INITIAL_AREAS.map((area) => {
    const sources = getResearchSourcesByArea(area.slug);

    return {
      slug: area.slug,
      name: area.name,
      center: area.center,
      officialSourceCount: sources.filter((source) => source.sourceType !== "news")
        .length,
      reviewCandidateCount: sources.filter(
        (source) => getResearchSourceIntakeStatus(source) === "candidate_needs_review",
      ).length,
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Map"
        title="注意報告マップ"
        description="現在確認できる場所と、エリア別の確認先を地図で見られます。"
        primaryAction={{ href: "/reports/new", label: "注意報告を送る" }}
      />

      <Section
        title="地図"
        description="OpenStreetMapを利用しています。公開できる位置情報がある場所を表示します。"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <LeafletMap center={getAreaCenter()} places={markerPlaces} zoom={12} />

          <aside className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-lg font-bold text-ink">表示対象</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              地図には、公開できる報告と位置情報がそろった場所を表示します。報告が少ないエリアは公式確認先も確認できます。
            </p>
            <div className="mt-5 grid gap-3 text-sm text-muted">
              <p>地図表示: {markerPlaces.length}件</p>
              <p>承認済み投稿のある場所: {places.length}件</p>
              <p>公式確認先: {sourceMetrics.officialSources}件</p>
              <p>審査中の確認候補: {sourceMetrics.candidateNeedsReviewSources}件</p>
            </div>
            <Link
              href="/areas"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-line px-4 text-sm font-semibold text-ink no-underline hover:bg-paper"
            >
              エリア一覧を見る
            </Link>
          </aside>
        </div>

        <div className="mt-6 grid gap-4 rounded-md border border-line bg-white p-5 md:grid-cols-2 lg:grid-cols-5">
          {[
            "エリア別に確認",
            "料金説明",
            "明細確認",
            "確認レベル",
            "公式確認先",
          ].map((label) => (
            <div key={label}>
              <p className="text-xs font-semibold text-muted">{label}</p>
              <p className="mt-2 text-sm leading-6 text-ink">
                公開基準を満たす情報だけを表示します。
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <PublicNotice />
        </div>
      </Section>

      <Section title="承認済み投稿がある場所">
        {places.length > 0 ? (
          <div className="grid gap-4">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <>
            <EmptyState message="この条件で表示できる場所はまだありません。エリア別の確認先と情報提供フォームを用意しています。" />
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {areaSignals.map((area) => (
                <article
                  key={area.slug}
                  className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]"
                >
                  <p className="text-xs font-semibold text-action">{area.center}</p>
                  <h3 className="mt-2 text-lg font-bold text-ink">{area.name}</h3>
                  <div className="mt-4 grid gap-2 text-sm text-muted">
                    <p>承認済み報告: 0件</p>
                    <p>公式確認先: {area.officialSourceCount}件</p>
                    <p>審査中の確認候補: {area.reviewCandidateCount}件</p>
                  </div>
                  <p className="mt-4 text-xs leading-6 text-muted">
                    まずは公式確認先と入店前チェックリストを確認できます。
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                    <Link className="text-action no-underline" href={`/areas/${area.slug}`}>
                      エリアを見る
                    </Link>
                    <Link
                      className="text-action no-underline"
                      href={`/reports/quick?area=${area.slug}`}
                    >
                      情報提供する
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </Section>
    </>
  );
}
