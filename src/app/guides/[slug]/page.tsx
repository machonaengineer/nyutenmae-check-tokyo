import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { INITIAL_AREAS } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";
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

  return createPageMetadata({
    title: `${guide.title}｜入店前チェック東京`,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    imageLabel: `${guide.shortTitle}・確認項目・相談先`,
  });
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getSearchGuide(slug);

  if (!guide) {
    notFound();
  }

  const decisionFlow = [
    {
      title: "1. 入店前または支払い前に確認する",
      text: `このガイドは「${guide.searchIntent}」という状況で、短時間でも確認しやすい項目を先に並べています。会計後に思い出すより、入店前や支払い前に条件を分けて確認することを重視します。`,
    },
    {
      title: "2. 後から説明できる資料を残す",
      text: "相談や情報提供では、感想よりも日時、場所、人数、説明内容、支払い方法、明細の有無が重要です。証拠画像や連絡先は公開せず、管理者確認用として扱います。",
    },
    {
      title: "3. 必要なら相談先へつなぐ",
      text: "身の危険がある場合は安全確保を優先し、緊急時は110番、緊急ではない警察相談は#9110、契約や支払いの相談は188やカード会社を確認します。",
    },
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow="Guide"
        title={guide.title}
        description={guide.description}
        primaryAction={{ href: "/reports/quick", label: "30秒で情報提供" }}
      />

      <Section
        title="このガイドの使い方"
        description="外部の投稿や記事を読む前に、自分が確認できる項目、残せる資料、相談先を分けるための実用ページです。"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {decisionFlow.map((item) => (
            <article className="rounded-md border border-line bg-white p-5" key={item.title}>
              <h2 className="text-base font-bold leading-6 text-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

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
        description="エリアごとの公式確認先、公開済み情報、情報提供導線へ移動できます。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {INITIAL_AREAS.map((area) => (
            <Link
              className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
              href={`/areas/${area.slug}`}
              key={area.slug}
            >
              {area.name}の入店前チェック
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
