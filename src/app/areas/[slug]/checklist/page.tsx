import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MonetizationSlot } from "@/components/growth/monetization-slot";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import {
  CHECKOUT_CHECK_ITEMS,
  ENTRY_CHECK_ITEMS,
  RECORD_KEEP_ITEMS,
  getAreaChecklist,
} from "@/lib/growth-content";
import { createPageMetadata } from "@/lib/seo";
import { INITIAL_AREAS } from "@/lib/site";

type AreaChecklistPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return INITIAL_AREAS.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({
  params,
}: AreaChecklistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = getAreaChecklist(slug);

  if (!area) {
    return {
      title: "エリア別チェックリスト",
    };
  }

  return createPageMetadata({
    title: `${area.name}の入店前チェックリスト｜入店前チェック東京`,
    description: `${area.name}周辺で入店前、会計前、退店後に確認したい料金説明、明細、記録保存のチェックリストです。`,
    path: `/areas/${slug}/checklist`,
    imageLabel: `${area.name}・チェックリスト・相談先`,
  });
}

export default async function AreaChecklistPage({ params }: AreaChecklistPageProps) {
  const { slug } = await params;
  const area = getAreaChecklist(slug);

  if (!area) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${area.name}の入店前チェックリスト`,
    description: `${area.center}で入店前に確認したい料金説明、明細、記録保存のチェック項目です。`,
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <PageHeader
        eyebrow="Area Checklist"
        title={`${area.name}の入店前チェックリスト`}
        description={`${area.center}で、料金説明、会計内容、明細提示、退店時対応を確認するための項目です。`}
        primaryAction={{ href: `/areas/${slug}`, label: "エリア情報を見る" }}
      />

      <Section title="このエリアで特に確認したいこと">
        <SimpleList items={area.tips} />
        <div className="mt-6">
          <PolicyNote>
            本ページは入店前確認の補助情報です。掲載内容は特定の店舗や個人について事実を断定するものではありません。
          </PolicyNote>
        </div>
      </Section>

      <Section title="入店前の確認">
        <SimpleList items={ENTRY_CHECK_ITEMS} />
      </Section>

      <Section title="会計前の確認">
        <SimpleList items={CHECKOUT_CHECK_ITEMS} />
      </Section>

      <Section title="退店後に保存する情報">
        <SimpleList items={RECORD_KEEP_ITEMS} />
      </Section>

      <Section title="次の行動">
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
            href={`/areas/${slug}`}
          >
            エリアの公開情報を見る
          </Link>
          <Link
            className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
            href="/support"
          >
            相談先を確認する
          </Link>
          <Link
            className="rounded-md border border-line bg-white p-5 text-sm font-semibold text-ink no-underline shadow-[0_8px_22px_rgb(23_32_42/0.04)] transition hover:bg-paper"
            href="/reports/new"
          >
            注意報告を送る
          </Link>
        </div>
        <div className="mt-6">
          <MonetizationSlot placement="area" />
        </div>
      </Section>
    </>
  );
}
