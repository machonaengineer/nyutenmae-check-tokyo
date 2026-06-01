import type { Metadata } from "next";
import Link from "next/link";
import { MapExplorer } from "@/components/map-explorer";
import { PageHeader, Section } from "@/components/page-blocks";
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

type MapPageProps = {
  searchParams: Promise<{
    area?: string;
    tag?: string;
    evidence?: string;
    q?: string;
  }>;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const places = await getPublicPlaceSummaries();
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
      coordinates: area.coordinates,
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
        <MapExplorer
          places={places}
          center={getAreaCenter()}
          areaOptions={areaSignals}
          initialFilters={{
            area: getFirstParam(params.area),
            tag: getFirstParam(params.tag),
            evidence: getFirstParam(params.evidence),
            query: getFirstParam(params.q),
          }}
          sourceMetrics={sourceMetrics}
        />
      </Section>

      {places.length === 0 ? (
        <Section title="エリア別の確認先">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        </Section>
      ) : null}
    </>
  );
}
