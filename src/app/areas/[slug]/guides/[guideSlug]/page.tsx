import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { getAreaSearchGuide, SEARCH_GUIDES } from "@/lib/search-guides";
import { INITIAL_AREAS } from "@/lib/site";

type AreaGuidePageProps = {
  params: Promise<{ slug: string; guideSlug: string }>;
};

export function generateStaticParams() {
  return INITIAL_AREAS.flatMap((area) =>
    SEARCH_GUIDES.map((guide) => ({
      slug: area.slug,
      guideSlug: guide.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: AreaGuidePageProps): Promise<Metadata> {
  const { slug, guideSlug } = await params;
  const content = getAreaSearchGuide(slug, guideSlug);

  if (!content) {
    return {
      title: "エリア別実用ガイド",
    };
  }

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: `/areas/${slug}/guides/${guideSlug}`,
    },
  };
}

export default async function AreaGuidePage({ params }: AreaGuidePageProps) {
  const { slug, guideSlug } = await params;
  const content = getAreaSearchGuide(slug, guideSlug);

  if (!content) {
    notFound();
  }

  const { area, guide } = content;

  return (
    <>
      <PageHeader
        eyebrow="Area Guide"
        title={content.title}
        description={content.description}
        primaryAction={{ href: `/reports/quick?area=${area.slug}`, label: "30秒で情報提供" }}
      />

      <Section title={`${area.name}で先に確認すること`} description={content.localFocus}>
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-md border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-ink">確認項目</h2>
            <div className="mt-4">
              <SimpleList items={guide.beforeActions} />
            </div>
          </article>
          <article className="rounded-md border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-ink">保存したい資料</h2>
            <div className="mt-4">
              <SimpleList items={guide.evidenceToSave} />
            </div>
          </article>
        </div>
      </Section>

      <Section title="公開投稿が少ない段階の見方">
        <PolicyNote>
          {content.zeroStateValue} 掲載内容は投稿者の申告に基づく注意情報として扱い、承認済み投稿だけを公開します。
        </PolicyNote>
      </Section>

      <Section title="関連導線">
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href={`/areas/${area.slug}`}
          >
            {area.name}の公開情報
          </Link>
          <Link
            className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href={`/areas/${area.slug}/topics/${guide.relatedTopicSlug}`}
          >
            関連テーマを見る
          </Link>
          <Link
            className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href="/support"
          >
            相談先を見る
          </Link>
        </div>
      </Section>
    </>
  );
}
