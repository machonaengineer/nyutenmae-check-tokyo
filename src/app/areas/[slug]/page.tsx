import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { LeafletMap } from "@/components/leaflet-map";
import { PageHeader, PolicyNote, Section } from "@/components/page-blocks";
import { PlaceCard } from "@/components/place-card";
import { PublicNotice } from "@/components/public-notice";
import { ResearchSourceCard } from "@/components/research-source-card";
import { SocialShareActions } from "@/components/social-share-actions";
import { getAreaDeepGuide } from "@/lib/area-content";
import {
  AREA_GROWTH_PRIORITY_LABELS,
  getAreaGrowthPlan,
} from "@/lib/area-growth";
import {
  getAreaCenter,
  getPublicAreaSummary,
  getPublicPlaceSummaries,
} from "@/lib/public-data";
import { getResearchSourcesByArea } from "@/lib/research-sources";
import { SEARCH_GUIDES } from "@/lib/search-guides";
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
  const guide = getAreaDeepGuide(slug);
  const growthPlan = getAreaGrowthPlan(slug);

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
          <Link
            className="ml-0 mt-3 inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper sm:ml-3 sm:mt-0"
            href={`/areas/${slug}/evidence`}
          >
            記録保存ガイドを見る
          </Link>
          <Link
            className="ml-0 mt-3 inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper sm:ml-3 sm:mt-0"
            href={`/areas/${slug}/contribute`}
          >
            情報提供の粒度を見る
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

      {guide ? (
        <Section
          title="このエリアで確認したいこと"
          description={guide.profile}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-md border border-line bg-white p-5">
              <h2 className="text-lg font-bold text-ink">入店前</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-muted">
                {guide.preEntryChecks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-md border border-line bg-white p-5">
              <h2 className="text-lg font-bold text-ink">会計前後</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-muted">
                {guide.billingChecks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </Section>
      ) : null}

      {growthPlan ? (
        <Section
          title="情報提供してほしい具体項目"
          description={growthPlan.searchIntent}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
              <p className="text-xs font-semibold text-action">
                {AREA_GROWTH_PRIORITY_LABELS[growthPlan.priority]}
              </p>
              <h2 className="mt-2 text-lg font-bold text-ink">提供してほしい情報</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {growthPlan.contributionAsk}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                {growthPlan.immediateDataNeed}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-action px-4 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
                  href={`/reports/new?area=${slug}`}
                >
                  情報提供する
                </Link>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface px-4 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
                  href={`/areas/${slug}/contribute`}
                >
                  入力粒度を見る
                </Link>
              </div>
            </article>
            <article className="rounded-md border border-line bg-white p-5 shadow-[0_8px_22px_rgb(23_32_42/0.04)]">
              <h2 className="text-lg font-bold text-ink">公開投稿が少ない段階の価値</h2>
              <p className="mt-4 text-sm leading-7 text-muted">
                {growthPlan.publicZeroStateValue}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                {growthPlan.monetizationGate}
              </p>
              <div className="mt-5">
                <PolicyNote>
                  情報提供は公開承認ではありません。投稿者メール、証拠画像、非公開メモは一般公開せず、管理者が公開可否と表現を確認します。
                </PolicyNote>
              </div>
            </article>
          </div>
        </Section>
      ) : null}

      <Section
        title="このエリアの実用ガイド"
        description="検索されやすい場面別に、入店前確認、資料保存、相談準備を確認できます。"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SEARCH_GUIDES.map((guide) => (
            <Link
              className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
              href={`/areas/${slug}/guides/${guide.slug}`}
              key={guide.slug}
            >
              {guide.shortTitle}
              <span className="mt-2 block font-normal leading-6 text-muted">
                {guide.description}
              </span>
            </Link>
          ))}
        </div>
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
