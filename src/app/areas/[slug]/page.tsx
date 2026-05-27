import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { LeafletMap } from "@/components/leaflet-map";
import { PageHeader, Section } from "@/components/page-blocks";
import { PlaceCard } from "@/components/place-card";
import { PublicNotice } from "@/components/public-notice";
import { ResearchSourceCard } from "@/components/research-source-card";
import { SocialShareActions } from "@/components/social-share-actions";
import {
  getAreaCenter,
  getPublicAreaSummary,
  getPublicPlaceSummaries,
} from "@/lib/public-data";
import { getResearchSourcesByArea } from "@/lib/research-sources";
import { getAbsoluteSiteUrl } from "@/lib/social";
import { INITIAL_AREAS } from "@/lib/site";
import { TOPIC_GUIDES } from "@/lib/topic-content";

type AreaPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return INITIAL_AREAS.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: AreaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = await getPublicAreaSummary(slug);

  if (!area) {
    return {
      title: "対象エリア",
    };
  }

  return {
    title: area.name,
    description: `${area.name}の承認済み注意報告を確認するページです。`,
  };
}

export default async function AreaDetailPage({ params }: AreaPageProps) {
  const { slug } = await params;
  const area = await getPublicAreaSummary(slug);

  if (!area) {
    notFound();
  }

  const places = await getPublicPlaceSummaries({ areaSlug: slug });
  const markerPlaces = places.filter(
    (place) => place.latitude !== null && place.longitude !== null,
  );
  const researchSources = getResearchSourcesByArea(slug);

  return (
    <>
      <PageHeader
        eyebrow="Area"
        title={area.name}
        description={`${area.centerLabel}の承認済み注意報告を表示します。一般公開できない情報は表示しません。`}
        primaryAction={{ href: "/map", label: "地図を見る" }}
      />

      <Section
        title="エリア地図"
        description="承認済み投稿があり、公開可能な位置情報がある場所のみを表示します。"
      >
        <LeafletMap center={getAreaCenter(slug)} places={markerPlaces} zoom={14} />
        <div className="mt-6">
          <PublicNotice />
        </div>
      </Section>

      <Section title="このエリアの公開情報">
        <div className="mb-6">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href={`/areas/${slug}/checklist`}
          >
            このエリアの確認リストを見る
          </Link>
        </div>
        {places.length > 0 ? (
          <div className="grid gap-4">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <EmptyState message="このエリアには、現在一般公開できる承認済み投稿がありません。" />
        )}
      </Section>

      <Section
        title="このエリアの種別別ガイド"
        description="料金説明、明細提示、客引き経由の来店など、テーマ別に確認項目を整理しています。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {TOPIC_GUIDES.map((topic) => (
            <Link
              key={topic.slug}
              className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
              href={`/areas/${slug}/topics/${topic.slug}`}
            >
              {topic.title}
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="このエリアの公式確認先"
        description="店舗や個人への断定に使わず、公的な相談先や地域の取組を確認するためのリンクとして整理しています。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {researchSources.map((source) => (
            <ResearchSourceCard key={source.id} source={source} />
          ))}
        </div>
      </Section>

      <Section title="このエリアを共有する">
        <SocialShareActions title={`${area.name}の入店前確認`} url={getAbsoluteSiteUrl(`/areas/${slug}`)} />
      </Section>
    </>
  );
}
