import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { INITIAL_AREAS } from "@/lib/site";
import { getTopicGuide, TOPIC_GUIDES } from "@/lib/topic-content";

type TopicPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return TOPIC_GUIDES.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicGuide(slug);

  if (!topic) {
    return {
      title: "トラブル種別別ガイド",
    };
  }

  return {
    title: topic.title,
    description: topic.description,
    alternates: {
      canonical: `/topics/${slug}`,
    },
  };
}

export default async function TopicDetailPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = getTopicGuide(slug);

  if (!topic) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: topic.title,
        description: topic.description,
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `${topic.title}では何を確認すべきですか？`,
            acceptedAnswer: {
              "@type": "Answer",
              text: topic.checks.join("。"),
            },
          },
          {
            "@type": "Question",
            name: `${topic.title}で保存すべき情報は何ですか？`,
            acceptedAnswer: {
              "@type": "Answer",
              text: topic.saveItems.join("。"),
            },
          },
          {
            "@type": "Question",
            name: "公開時に注意すべきことは何ですか？",
            acceptedAnswer: {
              "@type": "Answer",
              text: topic.publicDisplayNotes.join("。"),
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <PageHeader
        eyebrow="Topic Guide"
        title={topic.title}
        description={topic.description}
        primaryAction={{ href: "/support", label: "相談先を見る" }}
      />

      <Section title="確認項目">
        <SimpleList items={topic.checks} />
        <div className="mt-6">
          <PolicyNote>
            入店前の料金確認を推奨します。本ガイドは特定の店舗や個人について事実を断定するものではありません。身の危険を感じた場合は、安全確保を優先してください。
          </PolicyNote>
        </div>
      </Section>

      <Section
        title="このテーマの使い方"
        description="入店前、会計前後、相談前に見返しやすいよう、行動単位で整理します。"
      >
        <SimpleList items={topic.howToUse} />
      </Section>

      <Section
        title="保存しておきたい情報"
        description="投稿や相談で必要になりやすい情報です。公開するためではなく、後から確認できる状態にすることを目的にします。"
      >
        <SimpleList items={topic.saveItems} />
      </Section>

      <Section
        title="公開時の扱い"
        description="入店前チェック東京では、投稿者の申告情報、証拠、公開サマリーを分けて扱います。"
      >
        <SimpleList items={topic.publicDisplayNotes} />
        <div className="mt-6">
          <PolicyNote>
            投稿者の申告に基づく情報です。事実確認中の情報を含みます。入店前の料金確認を推奨します。
          </PolicyNote>
        </div>
      </Section>

      <Section title="関連ページ">
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
            href="/checklists"
          >
            入店前チェックリスト
          </Link>
          <Link
            className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
            href="/map"
          >
            注意報告マップ
          </Link>
          <Link
            className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
            href="/reports/new"
          >
            注意報告を送る
          </Link>
        </div>
      </Section>

      <Section
        title="エリア別に確認する"
        description="掲載対象エリアごとに、このテーマの確認項目と公開情報を確認できます。"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {INITIAL_AREAS.map((area) => (
            <Link
              key={area.slug}
              className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
              href={`/areas/${area.slug}/topics/${topic.slug}`}
            >
              {area.name}の{topic.title}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
