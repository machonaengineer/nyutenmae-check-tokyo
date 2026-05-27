import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { getAreaDeepGuide } from "@/lib/area-content";
import { INITIAL_AREAS } from "@/lib/site";

type AreaContributePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return INITIAL_AREAS.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({
  params,
}: AreaContributePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getAreaDeepGuide(slug);

  if (!guide) {
    return {
      title: "エリア別情報提供",
    };
  }

  return {
    title: `${guide.name}の情報提供`,
    description: `${guide.name}周辺で入店前確認に役立つ情報を提供する際の粒度と注意点を整理します。`,
    alternates: {
      canonical: `/areas/${slug}/contribute`,
    },
  };
}

export default async function AreaContributePage({
  params,
}: AreaContributePageProps) {
  const { slug } = await params;
  const guide = getAreaDeepGuide(slug);

  if (!guide) {
    notFound();
  }

  const sourceItems = [
    "公的機関、自治体、警察、消費生活相談の公式ページURL",
    "報道URL、確認日、独自要約",
    "自分の体験に基づく説明内容、会計内容、明細提示の経緯",
    "Google口コミ、食べログ、SNS、ニュース本文の転載は禁止しない",
  ] as const;

  const reviewFlow = [
    "投稿は pending / Hidden の非公開状態で保存します",
    "管理者が証拠、表現、個人情報、異議申立てリスクを確認します",
    "公開する場合も、投稿者の申告に基づく注意情報として表示します",
    "証拠画像、投稿者メール、非公開メモ、Storage上の保存パスは公開しません",
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow="Contribute"
        title={`${guide.name}の情報提供`}
        description={guide.shareText}
        primaryAction={{ href: `/reports/new?area=${guide.slug}`, label: "注意報告を送る" }}
      />

      <Section
        title="特に欲しい情報"
        description="店舗評価ではなく、入店前確認に役立つ事実関係を集めます。"
      >
        <SimpleList items={guide.reportingFocus} />
      </Section>

      <Section
        title="出典として使える情報"
        description="転載ではなく、出典URL、確認日、独自要約として扱います。"
      >
        <SimpleList items={sourceItems} />
      </Section>

      <Section title="管理者の確認観点">
        <SimpleList items={guide.operatorReviewFocus} />
      </Section>

      <Section title="公開までの流れ">
        <SimpleList items={reviewFlow} />
        <div className="mt-6">
          <PolicyNote>
            投稿者の申告に基づく情報です。事実確認中の情報を含みます。入店前の料金確認を推奨します。
          </PolicyNote>
        </div>
      </Section>

      <Section title="次の行動">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md bg-action px-5 text-sm font-semibold text-white no-underline transition hover:bg-action-dark"
            href={`/reports/new?area=${guide.slug}`}
          >
            このエリアで報告する
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-white px-5 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            href={`/areas/${guide.slug}/evidence`}
          >
            記録保存ガイドを見る
          </Link>
        </div>
      </Section>
    </>
  );
}
