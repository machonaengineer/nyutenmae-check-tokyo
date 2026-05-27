import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { INITIAL_AREAS } from "@/lib/site";
import { getSearchGuide, SEARCH_GUIDES } from "@/lib/search-guides";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SEARCH_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getSearchGuide(slug);

  if (!guide) {
    return {
      title: "実用ガイド",
    };
  }

  return {
    title: guide.title,
    description: guide.description,
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getSearchGuide(slug);

  if (!guide) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Guide"
        title={guide.title}
        description={guide.description}
        primaryAction={{ href: "/reports/quick", label: "30秒で情報提供" }}
      />

      <Section title="このページで確認すること" description={guide.summary}>
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-md border border-line bg-white p-5">
            <h2 className="text-lg font-bold text-ink">入店前・会計前の確認</h2>
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

      <Section title="相談前の整理">
        <SimpleList items={guide.consultationSteps} />
        <div className="mt-6">
          <PolicyNote>
            {guide.reportPrompt} 証拠画像、投稿者メールアドレス、非公開メモは一般公開しません。
          </PolicyNote>
        </div>
      </Section>

      <Section title="避けたいこと">
        <SimpleList items={guide.avoidActions} />
      </Section>

      <Section
        title="エリア別に見る"
        description="同じテーマを、対象エリアごとの確認項目として表示します。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {INITIAL_AREAS.map((area) => (
            <Link
              className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
              href={`/areas/${area.slug}/guides/${guide.slug}`}
              key={area.slug}
            >
              {area.name}の{guide.shortTitle}ガイド
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
