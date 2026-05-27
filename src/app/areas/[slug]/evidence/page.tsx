import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, PolicyNote, Section, SimpleList } from "@/components/page-blocks";
import { getAreaDeepGuide } from "@/lib/area-content";
import { INITIAL_AREAS } from "@/lib/site";

type AreaEvidencePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return INITIAL_AREAS.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({
  params,
}: AreaEvidencePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getAreaDeepGuide(slug);

  if (!guide) {
    return {
      title: "記録保存ガイド",
    };
  }

  return {
    title: `${guide.name}の記録保存ガイド`,
    description: `${guide.name}周辺で料金説明、会計内容、明細提示に不安があった場合に保存したい情報を整理します。`,
    alternates: {
      canonical: `/areas/${slug}/evidence`,
    },
  };
}

export default async function AreaEvidencePage({ params }: AreaEvidencePageProps) {
  const { slug } = await params;
  const guide = getAreaDeepGuide(slug);

  if (!guide) {
    notFound();
  }

  const timelineItems = [
    "案内を受けた時刻、入店時刻、注文時刻、会計時刻、退店時刻を分けてメモする",
    "入店前説明、店内説明、会計時説明を混ぜずに記録する",
    "金額、人数、滞在時間、支払い方法、相談先への連絡日時を残す",
    "感想や評価ではなく、後から確認できる事実関係を中心に整理する",
  ] as const;

  const redactionItems = [
    "店員個人名、顔写真、電話番号、SNS IDは公開情報に含めない",
    "投稿者メールアドレス、カード番号、署名、会員番号は画像内でも隠す",
    "証拠画像は一般公開せず、管理者確認用として扱う",
    "外部口コミ、ニュース本文、SNS本文、スクリーンショットは転載しない",
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow="Evidence"
        title={`${guide.name}の記録保存ガイド`}
        description={`${guide.center}で入店前説明、会計内容、明細提示に不安があった場合に、後から確認しやすい形で情報を残すためのページです。`}
        primaryAction={{ href: `/reports/new?area=${guide.slug}`, label: "注意報告を送る" }}
      />

      <Section title="保存しておきたい情報">
        <SimpleList items={guide.evidenceToKeep} />
      </Section>

      <Section
        title="時系列で整理する"
        description="投稿や相談時に、説明の変化と会計内容を混同しないための整理項目です。"
      >
        <SimpleList items={timelineItems} />
      </Section>

      <Section
        title="公開前に隠す情報"
        description="証拠として重要でも、一般公開しない情報があります。"
      >
        <SimpleList items={redactionItems} />
        <div className="mt-6">
          <PolicyNote>
            証拠画像、投稿者メール、非公開メモは一般公開しません。公開サマリーは投稿者の申告に基づく注意情報として、管理者が表現を確認します。
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
            href="/support"
          >
            相談先を確認する
          </Link>
        </div>
      </Section>
    </>
  );
}
