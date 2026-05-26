import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { PlaceCard } from "@/components/place-card";
import { PublicNotice } from "@/components/public-notice";
import {
  getPublicAreaSummary,
  getPublicPlaceSummaries,
} from "@/lib/public-data";
import { INITIAL_AREAS } from "@/lib/site";
import {
  getTopicGuide,
  getTopicRiskTagLabels,
  TOPIC_GUIDES,
} from "@/lib/topic-content";

type AreaTopicPageProps = {
  params: Promise<{
    slug: string;
    topicSlug: string;
  }>;
};

export function generateStaticParams() {
  return INITIAL_AREAS.flatMap((area) =>
    TOPIC_GUIDES.map((topic) => ({
      slug: area.slug,
      topicSlug: topic.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: AreaTopicPageProps): Promise<Metadata> {
  const { slug, topicSlug } = await params;
  const area = await getPublicAreaSummary(slug);
  const topic = getTopicGuide(topicSlug);

  if (!area || !topic) {
    return {
      title: "エリア別確認ガイド",
    };
  }

  return {
    title: `${area.name}の${topic.title}`,
    description: `${area.name}周辺で${topic.title}に関して入店前に確認したい項目です。承認済みの注意報告がある場所だけを表示します。`,
    alternates: {
      canonical: `/areas/${slug}/topics/${topicSlug}`,
    },
  };
}

export default async function AreaTopicPage({ params }: AreaTopicPageProps) {
  const { slug, topicSlug } = await params;
  const area = await getPublicAreaSummary(slug);
  const topic = getTopicGuide(topicSlug);

  if (!area || !topic) {
    notFound();
  }

  const riskTagLabels = getTopicRiskTagLabels(topic.slug);
  const riskTagLabelSet = new Set<string>(riskTagLabels);
  const places = await getPublicPlaceSummaries({ areaSlug: area.slug });
  const relatedPlaces = riskTagLabels.length
    ? places.filter((place) =>
        place.riskTags.some((tag) => riskTagLabelSet.has(tag)),
      )
    : places;
  const reportHref = `/reports/new?area=${encodeURIComponent(area.slug)}&tag=${encodeURIComponent(topic.riskTagSlugs[0] ?? "")}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${area.name}の${topic.title}`,
    description: `${area.centerLabel}で${topic.title}に関して確認したい項目を整理します。`,
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <PageHeader
        eyebrow="Area Topic"
        title={`${area.name}の${topic.title}`}
        description={`${area.centerLabel}で、${topic.title}に関して入店前・会計前に確認したい項目です。公開情報は承認済みの注意報告に限定します。`}
        primaryAction={{ href: reportHref, label: "この内容で報告する" }}
      />

      <Section title="確認項目" description={topic.description}>
        <SimpleList items={topic.checks} />
        <div className="mt-6">
          <PolicyNote>
            投稿者の申告に基づく情報です。事実確認中の情報を含みます。入店前の料金確認を推奨します。
          </PolicyNote>
        </div>
      </Section>

      <Section
        title="関連する公開情報"
        description="承認済み投稿があり、このテーマに関連するリスクタグが付いた場所だけを表示します。"
      >
        {relatedPlaces.length > 0 ? (
          <div className="grid gap-4">
            {relatedPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <EmptyState message="現在、このテーマで一般公開できる承認済み投稿はありません。" />
        )}
        <div className="mt-6">
          <PublicNotice />
        </div>
      </Section>

      <Section title="このエリアの別テーマ">
        <div className="grid gap-4 md:grid-cols-2">
          {TOPIC_GUIDES.map((item) => (
            <Link
              key={item.slug}
              className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
              href={`/areas/${area.slug}/topics/${item.slug}`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
